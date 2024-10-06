import 'dotenv/config';
import employee from './routes/employee.js';
import wfh_request from './routes/wfh_request.js';
import teamlist from './routes/teamlist.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/employee', employee);
app.use('/wfh-request', wfh_request);
app.use('/teamlist', teamlist);
app.get('/', (req, res) => {
  res.json({ message: 'Testing Ping Success!' });
});

// Error Middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error('Error Middleware:', err, 500, err.stack);
  res.status(500).json({ error: true, message: err.message, stack: err.stack });
});

export default app;
