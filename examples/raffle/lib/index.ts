"use strict";

import { ZBClient, Job, CompleteFn, ZBWorker } from "zeebe-node";
import Storage from "./storage";
import { Tweet } from "twitter/lib/types";

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

const storage: Storage<Tweet> = new Storage<Tweet>();

interface StoreTweet {
  lotteryTag: string;
  tweet: Tweet;
}

interface LotteryId {
  lotteryTag: string;
}

interface WinningTweet {
  authorName: string;
  tweetId: string;
}

zbc.createWorker(
  "store-tweet",
  (job: Job<StoreTweet>, complete: CompleteFn<{}>) => {
    storage.new(job.variables.lotteryTag)
    storage.add(
      job.variables.lotteryTag,
      job.variables.tweet.user.screen_name,
      job.variables.tweet
    );
    complete.success();
  }
);

zbc.createWorker(
  "determine-winner",
  (
    job: Job<LotteryId>,
    complete: CompleteFn<WinningTweet>,
    worker: ZBWorker<LotteryId, {}, WinningTweet>
  ) => {
    const tweet = storage.take(job.variables.lotteryTag);
    worker.log(
      `${tweet.user.screen_name} is the winner of ${job.variables.lotteryTag}`
    );
    complete.success({
      authorName: tweet.user.screen_name,
      tweetId: tweet.id_str
    });
  }
);
zbc.createWorker("cleanup", (job: Job<LotteryId>, complete: CompleteFn<{}>) => {
  storage.drop(job.variables.lotteryTag);
  complete.success();
});
