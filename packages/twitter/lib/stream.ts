"use strict";

import { Duration, ZBClient } from "zeebe-node";
import T from "./twitter-client";
import {Tweet} from './types'
import {v4 as uuid} from "uuid";

export default (zbc: ZBClient, searchTerm: string) => {
  const stream = T.stream("statuses/filter", {
    track: searchTerm
  });

  stream.on("tweet", function(tweet: Tweet) {
    zbc.publishStartMessage({
      messageId: uuid(),
      name: "tweetFound",
      correlationKey: searchTerm,
      variables: { tweet, tweetId: tweet.id_str, author: tweet.user.screen_name, lotteryTag: searchTerm },
      timeToLive: Duration.seconds.of(10) // seconds
    });
  });
  console.log('Tweet stream listening to', process.env.TWITTER_SEARCH_TERM)
};
