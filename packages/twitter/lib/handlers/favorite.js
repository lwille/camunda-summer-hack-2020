"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_client_1 = __importDefault(require("../twitter-client"));
function favoriteTweetHandler(job, complete, worker) {
    console.log(`liking tweet with id ${job.variables.statusId}`);
    favorite(job.variables.statusId);
    complete.success();
}
function favorite(statusId) {
    twitter_client_1.default.post("favorites/create", {
        id: statusId
    }, function () {
        console.log("done");
    });
}
exports.default = {
    taskType: "favorite-tweet",
    taskHandler: favoriteTweetHandler,
    onReady: () => console.log(`Worker connected!`),
    onConnectionError: () => console.log(`Worker disconnected!`)
};
