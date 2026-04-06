import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/dist/index';
import { initDatabase } from '../backend/dist/database/supabase';

// Cache for database initialization
let dbInitialized = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  // Initialize database once
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // Create a wrapper to handle Express request/response
  return new Promise((resolve) => {
    app(req as any, res as any);

    res.on('finish', () => {
      resolve(null);
    });

    // Timeout after 25 seconds (Vercel limit is 30)
    setTimeout(() => {
      if (!res.writableEnded) {
        res.status(504).json({ error: 'Request timeout' });
        resolve(null);
      }
    }, 25000);
  });
};

