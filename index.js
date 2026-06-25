import dotenv from 'dotenv';
import { createApp, initServer } from './configs/app.js';

dotenv.config();

let appPromise;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = createApp();
  }

  const app = await appPromise;
  return app(req, res);
}

if (!process.env.VERCEL) {
  initServer();
}
