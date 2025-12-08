const net = require('net');
const app = require('./app');

const DEFAULT_PORT = 3001;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Try to find an available port starting at startPort.
 * If PORT env var is set, we will use it as-is and let the process error if in use (explicit choice).
 * Otherwise, we probe from DEFAULT_PORT upward to DEFAULT_PORT + 20.
 */
function findAvailablePort(startPort, retries = 20) {
  return new Promise((resolve) => {
    const tryPort = (port, remaining) => {
      const tester = net.createServer()
        .once('error', (err) => {
          if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && remaining > 0) {
            tester.close(() => tryPort(port + 1, remaining - 1));
          } else {
            // give up and still resolve with the original desired port
            resolve(port);
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(port));
        })
        .listen(port, HOST);
    };
    tryPort(startPort, retries);
  });
}

async function start() {
  let port = Number(process.env.PORT) || DEFAULT_PORT;

  // If PORT is explicitly set by env, do not auto-shift; honor it.
  if (!process.env.PORT) {
    port = await findAvailablePort(DEFAULT_PORT, 20);
  }

  const server = app.listen(port, HOST, () => {
    console.log(`Server running at http://${HOST}:${port}`);
    if (port !== DEFAULT_PORT && !process.env.PORT) {
      console.log(`Note: default port ${DEFAULT_PORT} was busy. Using available port ${port}.`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  module.exports = server;
}

start();
