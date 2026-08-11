const { io } = require('socket.io-client');

async function main() {
  const base = process.env.API_URL || 'http://localhost:3001';

  const healthRes = await fetch(`${base}/health`);
  const health = await healthRes.json();
  console.log('HEALTH', JSON.stringify(health));

  await new Promise((resolve, reject) => {
    const socket = io(base, { transports: ['websocket', 'polling'] });
    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('socket timeout'));
    }, 8000);

    socket.on('connect', () => {
      console.log('SOCKET connected', socket.id);
      socket.emit('ping');
    });

    socket.on('pong', (payload) => {
      console.log('PONG', JSON.stringify(payload));
      clearTimeout(timeout);
      socket.disconnect();
      resolve(undefined);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

main().catch((err) => {
  console.error('FAIL', err);
  process.exit(1);
});
