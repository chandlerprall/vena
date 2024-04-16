import { watch, existsSync, readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

const projectDir = process.cwd();

// websocket server
const wss = new WebSocketServer({ port: 2448 });

const connections = [];
wss.on('connection', function connection(ws) {
  connections.push(ws);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
});


// directory watcher
const watchSignal = new AbortController();
watch(
  projectDir,
  {
    recursive: true,
    signal: watchSignal.signal,
  },
  (eventType, filename) => {
    if (!existsSync(filename)) return;

    try {
      const fileSrc = readFileSync(filename, 'utf-8');
      if (fileSrc.includes('registerComponent(') === false) return;
    } catch(e) {
      return;
    }

    if (eventType === 'change') {
      connections.forEach((ws) => {
        ws.send(JSON.stringify({ type: 'reload', filename }));
      });
    } else {
      console.log('unhandled event', eventType, filename);
    }
  }
);

// on sigint, shut things down
process.on('SIGINT', () => {
  wss.close();
  watchSignal.abort();
});

console.log(`Listening for changes in ${projectDir}`);