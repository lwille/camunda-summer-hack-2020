"use strict";

import { ZBClient } from "zeebe-node";

if (!process.env.TWITTER_SEARCH_TERM) {
  throw "Twitter search term environment variable (TWITTER_SEARCH_TERM) required!"
}

if(!process.env.LOTTERY_DURATION) {
  throw "Lottery duration environment variable (LOTTERY_DURATION) required!"
}

const searchTerm = process.env.TWITTER_SEARCH_TERM
const duration = process.env.LOTTERY_DURATION

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

(async () => {
  const paths = ['./handlers/tweet']
  const handlers = await Promise.all(paths.map((path: string) => import(path)))
  handlers.map((handler: any) => zbc.createWorker(handler.default));
})();

;(async () => {
  const result = await zbc.createWorkflowInstance('lotteryProcess', {
    lotteryTag: searchTerm,
    lotteryDuration: duration,
	})
	console.log(result)
})()

import stream from './stream'
stream(zbc, searchTerm);
