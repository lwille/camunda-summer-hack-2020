'use strict';

import { ZBClient } from 'zeebe-node'
import {glob} from 'glob'

const zbc = new ZBClient({
	onReady: () => console.log(`Connected!`),
	onConnectionError: () => console.log(`Disconnected!`)
})

const handlers = glob.sync('handlers/*.js').map((path: string)=>require(path))
handlers.map((handler: any) => zbc.createWorker(handler))

require('./stream')(zbc)
