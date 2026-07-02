with open('server.ts', 'r') as f:
    content = f.read()

smtp_route = """  // Company SMTP Settings Route
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

  // Impact Ledger Route"""

content = content.replace("  // Impact Ledger Route", smtp_route)

# Update Impact Ledger logic
old_impact = """  // Impact Ledger Route
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
  });"""

new_impact = """  // Impact Ledger Route
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
  });"""

content = content.replace(old_impact, new_impact)

with open('server.ts', 'w') as f:
    f.write(content)
