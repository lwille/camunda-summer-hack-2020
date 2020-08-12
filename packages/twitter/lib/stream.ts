"use strict";

import { Duration, ZBClient } from "zeebe-node";
import T, { Tweet } from "./twitter-client";
import {v4 as uuid} from "uuid";

export default (zbc: ZBClient) => {
  const stream = T.stream("statuses/filter", {
    track: process.env.TWITTER_SEARCH_TERM || ""
  });

  stream.on("tweet", function(tweet: Tweet) {
    zbc.publishStartMessage({
      messageId: uuid(),
      name: "tweetFound",
      variables: { tweet, tweetId: tweet.id_str, author: tweet.user.screen_name },
      timeToLive: Duration.seconds.of(10) // seconds
    });
  });
  console.log('Tweet stream listening to', process.env.TWITTER_SEARCH_TERM)
};
