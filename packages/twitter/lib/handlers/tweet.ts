"use strict";
import { Job, ZBWorker, CompleteFn } from "zeebe-node";

import T from "../twitter-client";

interface OutputVariables {}

interface InputVariables {
  inReplyToStatusId?: string
}

interface Headers {
  messageTemplate: string // "Hallo {{variables.name}}, welcome to {{variables.dings}}"
}

type Inputs = { [index: string]: string}

function render(template:string, inputs:Inputs): string {
  let text = template
  for (var key in inputs) {
    text = text.replace(`{{${key}}}`, inputs[key] as string)
  }
  return text
}

function replyToTweetHandler(
  job: Job<InputVariables, Headers>,
  complete: CompleteFn<OutputVariables>,
  worker: ZBWorker<InputVariables, Headers, OutputVariables>
) {
  const message = render(job.customHeaders.messageTemplate, job.variables as Inputs);

  console.log(
    `sending tweet ${message}`
  );
  reply(message, job.variables.inReplyToStatusId);

  complete.success();
}

function reply(message: string,  replyToStatusId?: string) {
  T.post(
    "statuses/update",
    {
      status: message,
      in_reply_to_status_id: replyToStatusId
    },
    function() {
      console.log("done");
    }
  );
}
export default {
  taskType: "send-tweet",
  taskHandler: replyToTweetHandler,
  onReady: () => console.log(`Worker connected!`),
  onConnectionError: () => console.log(`Worker disconnected!`)
};
