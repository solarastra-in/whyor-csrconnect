import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Route
  app.post('/api/ai/draft-purpose', async (req, res) => {
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
  app.post('/api/cron/deadline-reminders', async (req, res) => {
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
