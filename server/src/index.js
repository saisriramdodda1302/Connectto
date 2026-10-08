import 'dotenv/config';
import http from 'node:http';
import { app } from './app.js';
import { migrate } from './db.js';
import { attachSocket } from './socket.js';

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

await migrate();

const server = http.createServer(app);
attachSocket(server);

const port = Number(process.env.PORT) || 4000;
server.listen(port, () => console.log(`api on :${port}`));
