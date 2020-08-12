"use strict";

import { ZBClient } from "zeebe-node";

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

(async () => {
  const paths = ['./handlers/tweet']
  const handlers = await Promise.all(paths.map((path: string) => import(path)))
  handlers.map((handler: any) => zbc.createWorker(handler.default));
})();

import stream from './stream'
stream(zbc);
