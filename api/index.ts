import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import the Express app
import app from '../backend/dist/index';
import { initDatabase } from '../backend/dist/database/supabase';

let dbInitialized = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    return new Promise((resolve) => {
      app(req as any, res as any);

      res.on('finish', () => {
        resolve(null);
      });

      // Timeout after 25 seconds
      setTimeout(() => {
        if (!res.writableEnded) {
          res.status(504).json({ error: 'Request timeout' });
          resolve(null);
        }
      }, 25000);
    });
  } catch (error: any) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
