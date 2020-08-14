import { Duration, ZBClient } from "zeebe-node";
import T from "./twitter-client";
import { Stream } from "twit"
import {Tweet} from './types'
import {v4 as uuid} from "uuid";

export default class TweetListener {
  stream: Stream
  zbc: ZBClient
  searchTerm: string
  messageName: string

  constructor(zbc: ZBClient, searchTerm: string, messageName: string) {
    this.zbc = zbc
    this.searchTerm = searchTerm
    this.messageName = messageName
    this.stream = T.stream("statuses/filter", {
      track: searchTerm
    });
  }

  public start() {
    console.log('Tweet stream listening to', this.searchTerm);
    this.stream.on("tweet", (tweet: Tweet) => {
      this.zbc.publishStartMessage({
        messageId: uuid(),
        name: this.messageName,
        correlationKey: this.searchTerm,
        variables: { tweet, tweetId: tweet.id_str, author: tweet.user.screen_name },
        timeToLive: Duration.seconds.of(10) // seconds
      });
    });
  }

  public stop() {
    this.stream.stop();
  }

}