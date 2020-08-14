"use strict";

import { ZBClient, Job, CompleteFn, ZBWorker } from "zeebe-node";
import Storage from "./storage";
import { Tweet } from "twitter/lib/types";
import TweetListener from "twitter/lib/tweet-listener";

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

const storage: Storage<Tweet> = new Storage<Tweet>();

const tweetListeners = new Map<string, TweetListener>()

interface StoreTweet {
  lotteryTag: string;
  tweet: Tweet;
}

interface LotteryId {
  lotteryTag: string;
}

interface DetermineWinner extends LotteryId {
  ignoreList?: string[];
}

interface WinningTweet {
  authorName: string;
  tweetId: string;
}

zbc.createWorker(
  "store-tweet",
  (
    job: Job<StoreTweet>,
    complete: CompleteFn<{}>,
    worker: ZBWorker<StoreTweet, {}, {}>
  ) => {
    worker.log(`Participant received ${job.variables.tweet.user.screen_name}`);
    storage.new(job.variables.lotteryTag);
    storage.add(
      job.variables.lotteryTag,
      job.variables.tweet.user.screen_name,
      job.variables.tweet
    );
    worker.log(`Participant recorded ${job.variables.tweet.user.screen_name}`);
    complete.success();
  }
);

zbc.createWorker(
  "determine-winner",
  (
    job: Job<DetermineWinner>,
    complete: CompleteFn<WinningTweet>,
    worker: ZBWorker<DetermineWinner, {}, WinningTweet>
  ) => {
    worker.log(`Trying to determinge winner for lotteryTag: ${job.variables.lotteryTag}`)
    let tweetListener = tweetListeners.get(job.variables.lotteryTag)
    worker.log(`tweetListener exists: ${tweetListeners.has(job.variables.lotteryTag)}`)
    if(!tweetListener) {
      complete.failure(`TweetListener for ${job.variables.lotteryTag} does not exist.`, 0);
    } else {
      tweetListener.stop();

      const tweet = storage.take(
        job.variables.lotteryTag,
        job.variables.ignoreList
      );
      worker.log(
        `${tweet.user.screen_name} is the winner of ${job.variables.lotteryTag}`
      );
      storage.drop(job.variables.lotteryTag);
      complete.success({
        authorName: tweet.user.screen_name,
        tweetId: tweet.id_str
      });
    }
  }
);

if (!process.env.LOTTERY_DURATION) {
  throw "Lottery duration environment variable (LOTTERY_DURATION) required!";
}
const duration = process.env.LOTTERY_DURATION;

if (!process.env.LOTTERY_IGNORE_LIST) {
  throw "Lottery name ignore list environment variable (LOTTERY_IGNORE_LIST) required!";
}
const ignoreList = process.env.LOTTERY_IGNORE_LIST.split(",");

const startRaffle = async (hashtag: string) => {
  const tweetListener = new TweetListener(zbc, hashtag, "tweetFound");
  tweetListeners.set(hashtag, tweetListener);

  await zbc.createWorkflowInstance("lotteryProcess", {
    lotteryTag: hashtag,
    lotteryDuration: duration,
    ignoreList: ignoreList
  });
  tweetListener.start();
};

module.exports = { startRaffle };
