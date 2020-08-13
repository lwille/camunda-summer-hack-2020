"use strict";

import { ZBClient, Job, CompleteFn, ZBWorker } from "zeebe-node";
import Storage from "./storage";
import { Tweet } from "twitter/lib/types";
import TweetListener from 'twitter/lib/tweet-listener'

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

const storage: Storage<Tweet> = new Storage<Tweet>();

var tweetListener: TweetListener;

interface StoreTweet {
  lotteryTag: string;
  tweet: Tweet;
}

interface LotteryId {
  lotteryTag: string;
}

interface DetermineWinner extends LotteryId {
  ignoreList?: string[]
}

interface WinningTweet {
  authorName: string;
  tweetId: string;
}

zbc.createWorker(
  "store-tweet",
  (job: Job<StoreTweet>, complete: CompleteFn<{}>, worker: ZBWorker<StoreTweet, {}, {}>) => {
    worker.log(`Participant received ${job.variables.tweet.user.screen_name}`)
    storage.new(job.variables.lotteryTag)
    storage.add(
      job.variables.lotteryTag,
      job.variables.tweet.user.screen_name,
      job.variables.tweet
    );
    worker.log(`Participant recorded ${job.variables.tweet.user.screen_name}`)
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
    const tweet = storage.take(job.variables.lotteryTag, job.variables.ignoreList);
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
  tweetListener.stop();
  complete.success();
});


if (!process.env.TWITTER_SEARCH_TERM) {
  throw "Twitter search term environment variable (TWITTER_SEARCH_TERM) required!"
}
const searchTerm = process.env.TWITTER_SEARCH_TERM

if(!process.env.LOTTERY_DURATION) {
  throw "Lottery duration environment variable (LOTTERY_DURATION) required!"
}
const duration = process.env.LOTTERY_DURATION

if(!process.env.LOTTERY_IGNORE_LIST) {
  throw "Lottery name ignore list environment variable (LOTTERY_IGNORE_LIST) required!"
}
const ignoreList = process.env.LOTTERY_IGNORE_LIST.split(",")

;(async () => {
  const result = await zbc.createWorkflowInstance('lotteryProcess', {
    lotteryTag: searchTerm,
    lotteryDuration: duration,
    ignoreList: ignoreList,
	})
  console.log(result)
  tweetListener = new TweetListener(zbc, searchTerm, "tweetFound");
  tweetListener.start();
})()


