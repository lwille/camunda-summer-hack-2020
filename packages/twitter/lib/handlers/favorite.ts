"use strict";
import { Job, ZBWorker, CompleteFn } from "zeebe-node";

import T from "../twitter-client";

interface OutputVariables {}

interface InputVariables {
  statusId?: string;
}

interface Headers {}

function favoriteTweetHandler(
  job: Job<InputVariables, Headers>,
  complete: CompleteFn<OutputVariables>,
  worker: ZBWorker<InputVariables, Headers, OutputVariables>
) {
  console.log(`liking tweet with id ${job.variables.statusId}`);
  favorite(job.variables.statusId);

  complete.success();
}

function favorite(statusId?: string) {
  T.post(
    "favorites/create",
    {
      id: statusId
    },
    function() {
      console.log("done");
    }
  );
}
export default {
  taskType: "favorite-tweet",
  taskHandler: favoriteTweetHandler,
  onReady: () => console.log(`Worker connected!`),
  onConnectionError: () => console.log(`Worker disconnected!`)
};
