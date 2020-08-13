"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_client_1 = __importDefault(require("../twitter-client"));
function render(template, inputs) {
    let text = template;
    for (var key in inputs) {
        text = text.replace(`{{${key}}}`, inputs[key]);
    }
    return text;
}
function replyToTweetHandler(job, complete, worker) {
    const message = render(job.customHeaders.messageTemplate, job.variables);
    console.log(`sending tweet ${message}`);
    reply(message, job.variables.inReplyToStatusId);
    complete.success();
}
function reply(message, replyToStatusId) {
    twitter_client_1.default.post("statuses/update", {
        status: message,
        in_reply_to_status_id: replyToStatusId
    }, function () {
        console.log("done");
    });
}
exports.default = {
    taskType: "send-tweet",
    taskHandler: replyToTweetHandler,
    onReady: () => console.log(`Worker connected!`),
    onConnectionError: () => console.log(`Worker disconnected!`)
};
