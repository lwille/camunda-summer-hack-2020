"use strict";

import { ZBClient } from "zeebe-node";

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

(async () => {
  const paths = ['./handlers/tweet', './handlers/favorite']
  const handlers = await Promise.all(paths.map((path: string) => import(path)))
  handlers.forEach((handler: any) => zbc.createWorker(handler.default));
})();
