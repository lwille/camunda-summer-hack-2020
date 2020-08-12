"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zeebe_node_1 = require("zeebe-node");
const storage_1 = __importDefault(require("./storage"));
const zbc = new zeebe_node_1.ZBClient({
    onReady: () => console.log(`Connected!`),
    onConnectionError: () => console.log(`Disconnected!`)
});
const storage = new storage_1.default();
zbc.createWorker("set-add", (job, complete) => {
    storage.add(job.variables.setName, job.variables.value);
    complete.success();
});
zbc.createWorker("set-new", (job, complete) => {
    storage.new(job.variables.setName);
    complete.success();
});
zbc.createWorker("set-take", (job, complete) => {
    const value = storage.take(job.variables.setName);
    complete.success({ value: value });
});
zbc.createWorker("set-drop", (job, complete) => {
    storage.drop(job.variables.setName);
    complete.success();
});
