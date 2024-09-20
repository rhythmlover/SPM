import 'dotenv/config';
import employee from './routes/employee.js';
import wfh_request from './routes/wfh_request.js';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/employee', employee);
app.use('/wfh_request', wfh_request);
app.get('/', (req, res) => {
  res.send('Tesing Ping Success!');
});

// Error Middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err, err.stack);
  res.status(500).json({ error: true, message: err.message, stack: err.stack });
});

// Start Server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
