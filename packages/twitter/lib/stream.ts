'use strict';

const { ZBClient, Duration, Job, Complete, ZBWorker } = require('zeebe-node')
const Twit = require('twit')
const uuid = require('uuidv4');

const zbc = new ZBClient({
	onReady: () => console.log(`Connected!`),
	onConnectionError: () => console.log(`Disconnected!`)
})

const T = new Twit({
	consumer_key:         process.env.TWITTER_CONSUMER_KEY || '',
	consumer_secret:      process.env.TWITTER_CONSUMER_SECRET || '',
	access_token:         process.env.TWITTER_ACCESS_TOKEN || '',
	access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
	timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
	strictSSL:            true,     // optional - requires SSL certificates to be valid.
  })

const stream = T.stream('statuses/filter', { track: process.env.TWITTER_SEARCH_TERM || '' })

stream.on('tweet', function (tweet: JSON) {
	
	zbc.publishStartMessage({
		messageId: uuid(),
		name: 'tweetFound',
		variables: { tweet },
		timeToLive: Duration.seconds.of(10), // seconds
	})
})
