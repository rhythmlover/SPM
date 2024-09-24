import app from './server.js';

const port = 3000;

// Graceful shutdown
const shutdown = async () => {
  await closeConnection();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start Server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
