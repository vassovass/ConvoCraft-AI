// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import readline from 'readline';
import net from 'net';
import { readFileSync } from 'fs';

dotenv.config();

const app = express();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    // Regex for any localhost port above 1023
    /^http:\/\/localhost:(102[4-9]|10[3-9][0-9]|1[1-9][0-9]{2}|[2-9][0-9]{3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/, 
    // Regex for local network IPs (192.168.x.x) on ports above 1023
    /^http:\/\/192\.168\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(102[4-9]|10[3-9][0-9]|1[1-9][0-9]{2}|[2-9][0-9]{3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
]; 

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(pattern => typeof pattern === 'string' ? pattern === origin : pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

// Read version from package.json for compatibility check
let APP_VERSION = '0.0.0';
try {
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
  APP_VERSION = pkg.version || APP_VERSION;
} catch {}

// Health endpoint returns version details
app.get('/health', (_req, res) => res.json({ status: 'ok', version: APP_VERSION }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
});

let PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined. Please check your .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/api/gemini',
  body('prompt').isString().notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { prompt } = req.body;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.json({ candidates: [{ content: { parts: [{ text }] } }] });
    } catch (error) {
      console.error('Error proxying to Gemini:', error);
      res.status(500).json({ error: 'Failed to proxy request to Gemini.' });
    }
  }
);

app.post('/api/gemini/transcribe',
  upload.single('file'),
  body('prompt').isString().notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const { prompt } = req.body;

      console.log(`[${new Date().toISOString()}] Transcription Request Received:`);
      console.log(`  - File: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`  - MIME Type: ${req.file.mimetype}`);
      console.log('Prompt length:', prompt.length, 'chars');

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const filePart = {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype,
        },
      };

      const result = await model.generateContent([prompt, filePart]);
      const response = await result.response;
      const text = response.text();

      res.json({ text });
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] Gemini Transcription Error:`, error.message);
      console.error(`[${timestamp}] Full Error Stack:`, error.stack);
      const msg = `[${timestamp}] ${error.message}`;
      res.status(500).json({ error: msg });
    }
  }
);

async function findNextAvailablePort(startPort, attempts = 20) {
  let port = startPort + 1;
  for (let i = 0; i < attempts; i++, port++) {
    if (await isPortFree(port)) return port;
  }
  return null;
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester
          .once('close', () => resolve(true))
          .close();
      })
      .listen(port, '0.0.0.0');
  });
}

async function handlePortConflictInteractively({ port, sameVersion, suggestedPort }) {
  if (!process.stdin.isTTY) return null;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const promptMsg = `Use existing${sameVersion ? '' : ' (may be different version)'} (u) | suggested ${suggestedPort} (s) | custom (c) | exit (e)? [u/s/c/e]: `;

  const answer = await new Promise((res) => rl.question(promptMsg, res));
  rl.close();
  const choice = answer.trim().toLowerCase();

  if (choice === 'e') return { action: 'exit' };
  if (choice === 'u' || choice === '') return { action: 'use-existing' };
  if (choice === 's' && suggestedPort) return { action: 'new-port', port: suggestedPort };

  // custom port path
  const portStr = await new Promise((res) => rl.question('Enter new port number (1-65535): ', res));
  const newPort = Number(portStr.trim());
  if (!Number.isInteger(newPort) || newPort < 1 || newPort > 65535) {
    return { action: 'invalid' };
  }
  return { action: 'new-port', port: newPort };
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const srv = app.listen(port, () => {
      PORT = port;
      console.log(`Server is running on port ${PORT}`);
      resolve(srv);
    });

    srv.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        // Quick health probe to see if it's another ConvoCraft instance
        let isConvocraft = false;
        let remoteVersion = null;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 1500);
          const res = await fetch(`http://localhost:${port}/health`, { signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok) {
            const json = await res.json();
            isConvocraft = json?.status === 'ok';
            remoteVersion = json?.version;
          }
        } catch (_) { /* ignore */ }

        const sameVersion = isConvocraft && remoteVersion === APP_VERSION;
        console.warn(`Port ${port} is in use${isConvocraft ? ` (ConvoCraft AI ${remoteVersion || ''} detected)` : ''}.`);

        // Find alternative port suggestion
        const suggestedPort = await findNextAvailablePort(port);

        const interactiveResult = await handlePortConflictInteractively({ port, sameVersion, suggestedPort });
        if (interactiveResult) {
          if (interactiveResult.action === 'exit') {
            console.log('Exiting without starting a new server.');
            process.exit(0);
          }
          if (interactiveResult.action === 'use-existing') {
            console.log('Using existing instance.');
            process.exit(0);
          }
          if (interactiveResult.action === 'invalid') {
            console.error('Invalid port entered. Exiting.');
            process.exit(1);
          }
          if (interactiveResult.action === 'new-port') {
            await startServer(interactiveResult.port);
            return resolve();
          }
        }

        // No TTY or interactiveResult null
        if (suggestedPort) {
          console.log(`Starting on alternate port ${suggestedPort}.`);
          try {
            await startServer(suggestedPort);
            resolve();
          } catch (e) {
            reject(e);
          }
        } else {
          console.error('Port is in use and no alternate port found. Exiting.');
          process.exit(1);
        }
      } else {
        reject(err);
      }
    });
  });
}

// Kick off server start
startServer(PORT).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 