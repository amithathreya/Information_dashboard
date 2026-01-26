import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';

const app = express();

// Request logging
app.use(morgan('combined'));

// Configure CORS with specific origins for better security
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'], // Default to common dev ports
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOptions));

// Apply general rate limiting to all routes
app.use(apiLimiter);

app.use('/', routes);

export default app;
