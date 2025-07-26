// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

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
const allowedOrigins = ['http://localhost:5173']; // Add your production frontend URL here
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
});

const PORT = process.env.PORT || 3001;
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
      console.error('Error proxying transcription to Gemini:', error);
      res.status(500).json({ error: 'Failed to proxy transcription request to Gemini.' });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 