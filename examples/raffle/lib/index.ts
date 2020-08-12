"use strict";

import { ZBClient, Job, CompleteFn } from "zeebe-node";
import Storage from "./storage";

const zbc = new ZBClient({
  onReady: () => console.log(`Connected!`),
  onConnectionError: () => console.log(`Disconnected!`)
});

const storage: Storage<string> = new Storage<string>();

interface SetName {
  setName: string;
}
interface SetAdd extends SetName {
  value: string;
}

zbc.createWorker("set-add", (job: Job<SetAdd>, complete: CompleteFn<{}>) => {
  storage.add(job.variables.setName, job.variables.value);
  complete.success();
});
zbc.createWorker("set-new", (job: Job<SetName>, complete: CompleteFn<{}>) => {
  storage.new(job.variables.setName);
  complete.success();
});
zbc.createWorker(
  "set-take",
  (job: Job<SetName>, complete: CompleteFn<{ value: string }>) => {
    const value = storage.take(job.variables.setName);
    complete.success({ value: value });
  }
);
zbc.createWorker("set-drop", (job: Job<SetName>, complete: CompleteFn<{}>) => {
  storage.drop(job.variables.setName);
  complete.success();
});
