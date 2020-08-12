"use strict";
import { Job, ZBWorker, CompleteFn } from "zeebe-node";

import T, { Tweet } from "../twitter-client";

interface OutputVariables {}

interface InputVariables {
  tweet: Tweet;
}

interface Headers {
  message: string;
}

function replyToTweetHandler(
  job: Job<InputVariables, Headers>,
  complete: CompleteFn<OutputVariables>,
  worker: ZBWorker<InputVariables, Headers, OutputVariables>
) {
  worker.log("Task variables" + job.variables);
  const message = job.customHeaders.message;
  const replyToStatusId = job.variables.tweet.id_str;
  const author = job.variables.tweet.user.screen_name;

  console.log(
    `will reply to tweet with status id ${replyToStatusId} and author ${author}`
  );
  reply(replyToStatusId, author, message);

  complete.success();
}

function reply(replyToStatusId: string, author: string, message: string) {
  T.post(
    "statuses/update",
    {
      status: `${message} @${author}!`,
      in_reply_to_status_id: replyToStatusId
    },
    function() {
      console.log("done");
    }
  );
}
export default {
  taskType: "reply-to-tweet",
  taskHandler: replyToTweetHandler,
  onReady: () => console.log(`Worker connected!`),
  onConnectionError: () => console.log(`Worker disconnected!`)
};
