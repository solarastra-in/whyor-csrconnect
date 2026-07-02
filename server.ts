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
        
        // 2. Check if employee (if not admin)
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

  // Impact Ledger Route
  app.post('/api/impact/log', verifyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { type, amount, description } = req.body;
      
      if (!type || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
      const db = getFirestore();
      
      const ledgerRef = db.collection(`users/${user.uid}/impactLedger`);
      const summaryRef = db.collection('users').doc(user.uid);

      await db.runTransaction(async (transaction) => {
        // Create an append-only ledger entry
        const newEntryRef = ledgerRef.doc();
        transaction.set(newEntryRef, {
          type,
          amount,
          description: description || '',
          timestamp: FieldValue.serverTimestamp()
        });

        // Update the aggregated summary for the user
        const summaryDoc = await transaction.get(summaryRef);
        const data = summaryDoc.exists ? summaryDoc.data()! : { totalHours: 0, communityPoints: 0 };
        
        let newHours = data.totalHours || 0;
        let newPoints = data.communityPoints || 0;

        if (type === 'hours') {
          newHours += amount;
        } else if (type === 'points') {
          newPoints += amount;
        }

        transaction.set(summaryRef, {
          totalHours: newHours,
          communityPoints: newPoints,
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

  // Automated Notification System Route
  app.post('/api/cron/deadline-reminders', verifyAuth, async (req, res) => {
    try {
      // Mock logic to simulate checking projects and notifying employees
      console.log('Running automated check for approaching project deadlines...');
      
      // We would normally query Firestore for upcoming deadlines 
      // and match them with user skills/saved projects.
      const simulatedEmailsSent = Math.floor(Math.random() * 10) + 1;
      
      console.log(`Mock automated emails sent to ${simulatedEmailsSent} employees about upcoming deadlines.`);
      
      res.json({ 
        success: true, 
        message: `Successfully processed deadline reminders. Sent ${simulatedEmailsSent} notifications.`,
        sentCount: simulatedEmailsSent
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
