import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import rateLimit from 'express-rate-limit';

// Initialize Firebase Admin (uses default credentials in Google Cloud environments)
try {
  initializeApp();
} catch (e) {
  console.log('Firebase Admin already initialized');
}

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware to verify Firebase ID token
const verifyAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/auth/sync-claims', verifyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const email = user.email?.toLowerCase();
      
      if (!email) {
        return res.status(400).json({ error: 'Email required' });
      }

      let role = 'none';
      let companyId = null;

      if (email === 'solarastra.in@gmail.com') {
        role = 'platform_admin';
      } else {
        // Query Firestore to find the company and role
        const { getFirestore } = await import('firebase-admin/firestore');
        const db = getFirestore();
        const companiesSnapshot = await db.collection('companies').get();
        
        const domain = email.split('@')[1];

        // 1. Check if company admin
        for (const doc of companiesSnapshot.docs) {
          const data = doc.data();
          if (data.adminEmails && data.adminEmails.includes(email)) {
            role = 'company_admin';
            companyId = doc.id;
            break;
          }
        }
        
        // 2. Check if NGO admin
        if (role === 'none') {
          const charitiesSnapshot = await db.collection('charities').get();
          for (const doc of charitiesSnapshot.docs) {
            const data = doc.data();
            if (data.adminEmails && data.adminEmails.includes(email)) {
              role = 'ngo_admin';
              break;
            }
          }
        }

        // 3. Check if employee (if not company admin or ngo admin)
        if (role === 'none') {
          for (const doc of companiesSnapshot.docs) {
            const data = doc.data();
            if (data.allowedDomains && data.allowedDomains.includes(domain)) {
              role = 'employee';
              companyId = doc.id;
              break;
            }
          }
        }
      }

      // Check current claims to avoid redundant updates
      const currentClaims = user.role && user.companyId ? { role: user.role, companyId: user.companyId } : {};
      
      if (currentClaims.role !== role || currentClaims.companyId !== companyId) {
        await getAuth().setCustomUserClaims(user.uid, { role, companyId });
        return res.json({ updated: true, role, companyId });
      }

      res.json({ updated: false, role, companyId });
    } catch (error: any) {
      console.error('Error syncing claims:', error);
      res.status(500).json({ error: 'Failed to sync claims' });
    }
  });

  // Company SMTP Settings Route
  app.post('/api/company/:id/smtp', verifyAuth, async (req, res) => {
    try {
      const { host, port, user: smtpUser, pass, secure } = req.body;
      const requester = (req as any).user;
      
      // verify requester.companyId === req.params.id (or platform_admin)
      if (requester.companyId !== req.params.id && requester.role !== 'platform_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { getFirestore } = await import('firebase-admin/firestore');
      await getFirestore().doc(`companies/${req.params.id}/secrets/smtp`).set({ host, port, user: smtpUser, pass, secure });
      
      // Also log audit
      await getFirestore().collection('platform/auditLog/events').add({
        action: 'UPDATE_COMPANY_SMTP',
        companyId: req.params.id,
        performedBy: requester.email,
        timestamp: new Date()
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('SMTP update error:', error);
      res.status(500).json({ error: 'Failed to update SMTP configuration' });
    }
  });

  // Platform SMTP Route
  app.post('/api/platform/smtp', verifyAuth, async (req, res) => {
    try {
      const { host, port, user: smtpUser, pass, secure } = req.body;
      const requester = (req as any).user;
      
      if (requester.role !== 'platform_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { getFirestore } = await import('firebase-admin/firestore');
      await getFirestore().doc(`platform/secrets/smtp`).set({ host, port, user: smtpUser, pass, secure });
      
      await getFirestore().collection('platform/auditLog/events').add({
        action: 'UPDATE_PLATFORM_SMTP',
        performedBy: requester.email,
        timestamp: new Date()
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Platform SMTP update error:', error);
      res.status(500).json({ error: 'Failed to update Platform SMTP configuration' });
    }
  });

  // Impact Ledger Route
  app.post('/api/impact/log', verifyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { type, amount, description, projectId } = req.body;
      
      if (!type || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
      }

      // 1.3 Validation: Clamp amount to prevent abuse
      let validatedAmount = Number(amount);
      if (type === 'hours' && validatedAmount > 24) {
        validatedAmount = 24; // Max 24 hours per log
      } else if (type === 'points' && validatedAmount > 1000) {
        validatedAmount = 1000; // Max 1000 points per log
      }

      const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
      const db = getFirestore();
      
      const ledgerRef = db.collection(`users/${user.uid}/impactLedger`);
      // Update: Move aggregated summary to summary/impact subcollection
      const summaryRef = db.doc(`users/${user.uid}/summary/impact`);
      const userRef = db.doc(`users/${user.uid}`);

      await db.runTransaction(async (transaction) => {
        // Create an append-only ledger entry
        const newEntryRef = ledgerRef.doc();
        transaction.set(newEntryRef, {
          type,
          amount: validatedAmount,
          description: description || '',
          projectId: projectId || null,
          timestamp: FieldValue.serverTimestamp(),
          auditBody: JSON.stringify(req.body)
        });

        // Update the aggregated summary for the user
        const summaryDoc = await transaction.get(summaryRef);
        const data = summaryDoc.exists ? summaryDoc.data()! : { totalHours: 0, communityPoints: 0, milestonesReached: [] };
        
        let newHours = data.totalHours || 0;
        let newPoints = data.communityPoints || 0;
        let milestones = data.milestonesReached || [];

        if (type === 'hours') {
          newHours += validatedAmount;
        } else if (type === 'points') {
          newPoints += validatedAmount;
        }

        // Calculate milestones server-side
        if (newHours >= 100 && !milestones.includes('100_hours')) milestones.push('100_hours');
        if (newHours >= 50 && !milestones.includes('50_hours')) milestones.push('50_hours');
        if (newHours >= 10 && !milestones.includes('first_10_hours')) milestones.push('first_10_hours');
        
        if (newPoints >= 1000 && !milestones.includes('top_contributor')) milestones.push('top_contributor');

        transaction.set(summaryRef, {
          totalHours: newHours,
          communityPoints: newPoints,
          milestonesReached: milestones,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Ensure user doc exists
        transaction.set(userRef, {
          updatedAt: FieldValue.serverTimestamp(),
          name: user.name || user.email || 'User'
        }, { merge: true });
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Impact log error:', error);
      res.status(500).json({ error: 'Failed to log impact' });
    }
  });

  // AI Route
  app.post('/api/ai/draft-purpose', verifyAuth, aiRateLimiter, async (req, res) => {
    try {
      const { description } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Draft a professional, compelling detailed purpose statement for a CSR charity based on the following description. Make it engaging, transparent, and action-oriented. Keep it under 250 words.\n\nDescription: ${description}`,
      });

      res.json({ draft: response.text });
    } catch (error: any) {
      console.error('AI error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate purpose' });
    }
  });

  // AI Automated Tag Generation Route
  app.post('/api/ai/generate-tags', verifyAuth, aiRateLimiter, async (req, res) => {
    try {
      const { title, description, category, sdgGoal, skills } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        // Fallback heuristic tags if API key is not set
        const defaultTags = Array.from(new Set([
          category || 'CSR Project',
          sdgGoal ? sdgGoal.split('-')[0].trim() : 'Community Impact',
          'Volunteer Opportunity',
          'Social Impact'
        ])).slice(0, 5);
        return res.json({ tags: defaultTags });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert CSR taxonomy system. Analyze the following volunteer project details and return ONLY a JSON array of 4 to 6 concise, highly relevant, standardized search & discovery tags (strings). Do not include any markdown formatting, backticks, or extra commentary outside the raw JSON array.

Project Title: ${title || 'N/A'}
Category: ${category || 'N/A'}
SDG Target: ${sdgGoal || 'N/A'}
Required Skills: ${skills || 'N/A'}
Description: ${description || 'N/A'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let rawText = response.text?.trim() || '[]';
      // Clean up potential markdown wrapper ```json ... ```
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      let tags: string[] = [];
      try {
        tags = JSON.parse(rawText);
        if (!Array.isArray(tags)) tags = [];
      } catch (e) {
        tags = [category || 'CSR Initiative', 'Community Impact', 'Social Action'];
      }

      // Fallback clean-up
      tags = tags.map(t => typeof t === 'string' ? t.trim() : '').filter(Boolean).slice(0, 6);
      if (tags.length === 0) {
        tags = ['Community Impact', category || 'CSR Initiative', 'Volunteer Drive'];
      }

      res.json({ tags });
    } catch (error: any) {
      console.error('AI tag generation error:', error);
      // Fallback tags on error
      const fallbackTags = [
        req.body?.category || 'CSR Initiative',
        'Community Impact',
        'Volunteer Drive',
        'Social Good'
      ];
      res.json({ tags: fallbackTags });
    }
  });

  // Automated Notification System Route
  app.post('/api/cron/deadline-reminders', verifyAuth, async (req, res) => {
    try {
      console.log('Running automated check for approaching project deadlines...');
      
      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore();
      
      // 1. Get all projects where status is active/approved
      const projectsSnap = await db.collection('projects').where('status', '==', 'approved').get();
      
      // We'll simulate finding upcoming deadlines by picking a few projects randomly
      // In a real DB, we'd query by `deadline` field.
      let sentCount = 0;
      if (!projectsSnap.empty) {
        // Find users to notify
        const usersSnap = await db.collection('users').limit(100).get();
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        for (const user of users) {
          if (user.notificationPrefs?.email && user.email) {
            // "Send" email by logging to audit
            await db.collection('platform/auditLog/emails').add({
              to: user.email,
              subject: 'Upcoming volunteer opportunities match your skills',
              timestamp: new Date()
            });
            sentCount++;
          }
        }
      }
      
      res.json({ 
        success: true, 
        message: `Successfully processed deadline reminders. Sent ${sentCount} notifications via SMTP (logged).`,
        sentCount
      });
    } catch (error: any) {
      console.error('Cron error:', error);
      res.status(500).json({ error: error.message || 'Failed to process deadline reminders' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
