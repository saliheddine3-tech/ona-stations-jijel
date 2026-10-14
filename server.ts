import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Get Database State
app.get('/api/data', (_req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return res.json(JSON.parse(content));
    }
    // If database doesn't exist yet, return empty object so client provides seed
    return res.status(404).json({ message: 'No stored cloud database yet' });
  } catch (error) {
    console.error('Failed to read db file:', error);
    return res.status(500).json({ error: 'Failed to read database' });
  }
});

// Sync / Update Database State
app.post('/api/sync', (req, res) => {
  try {
    const { data } = req.body;
    if (data && data.stations) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return res.json({ success: true, syncedAt: new Date().toISOString() });
    }
    return res.status(400).json({ error: 'Invalid data payload' });
  } catch (error) {
    console.error('Failed to save db file:', error);
    return res.status(500).json({ error: 'Failed to persist sync data' });
  }
});

// Update PIN endpoint
app.post('/api/pin-reset', (req, res) => {
  try {
    const { workerId, newPin, supervisorPhone } = req.body;
    if (!workerId || !newPin) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(content);
      if (Array.isArray(db.workers)) {
        const worker = db.workers.find((w: any) => w.id === workerId || w.phone === workerId);
        if (worker) {
          worker.pin = String(newPin);
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
          return res.json({ success: true, message: 'PIN updated successfully' });
        }
      }
    }
    return res.json({ success: true, message: 'Updated locally and will sync' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware in dev or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Station Center server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
