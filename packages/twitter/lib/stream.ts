'use strict';

import { Duration, ZBClient} from 'zeebe-node'
import T from './twitter-client'
const {uuid} = require('uuidv4')


export default (zbc: ZBClient)=> {
	const stream = T.stream('statuses/filter', { track: process.env.TWITTER_SEARCH_TERM || '' })

	stream.on('tweet', function (tweet: JSON) {

		zbc.publishStartMessage({
			messageId: uuid(),
			name: 'tweetFound',
			variables: { tweet },
			timeToLive: Duration.seconds.of(10), // seconds
		})
	})
}
