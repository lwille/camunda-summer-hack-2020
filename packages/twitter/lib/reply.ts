'use strict';
​
const { ZBClient, Duration, Job, Complete, ZBWorker } = require('zeebe-node')

const Twit = require('twit')
const T = new Twit({
	consumer_key:         process.env.TWITTER_CONSUMER_KEY || '',
	consumer_secret:      process.env.TWITTER_CONSUMER_SECRET || '',
	access_token:         process.env.TWITTER_ACCESS_TOKEN || '',
	access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
	timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
	strictSSL:            true,     // optional - requires SSL certificates to be valid.
  })
​
const zbc = new ZBClient({
	onReady: () => console.log(`Connected!`),
	onConnectionError: () => console.log(`Disconnected!`)
})
​
function replyToTweetHandler(job: typeof Job, complete: typeof Complete, worker: typeof ZBWorker) {
	worker.log('Task variables', job.variables)
​
	const message = job.customHeaders.message
	const replyToStatusId = job.variables.tweet.id_str
	const author = job.variables.tweet.user.screen_name

	console.log(`will reply to tweet with status id ${replyToStatusId} and author ${author}`);
	reply(replyToStatusId, author, message)
	
	complete.success()
}

function reply(replyToStatusId: string, author: string, message: string) {
	T.post('statuses/update', { status: `${message} @${author}!`, in_reply_to_status_id: replyToStatusId }, function() {
		console.log("done")
    })
}
​
const zbWorker = zbc.createWorker({
    taskType: 'reply-to-tweet',
    taskHandler: replyToTweetHandler,
    onReady: () => console.log(`Worker connected!`),
    onConnectionError: () => console.log(`Worker disconnected!`)
})