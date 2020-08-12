'use strict';

const { ZBClient, Duration } = require('zeebe-node')

const zbc = new ZBClient({
	onReady: () => console.log(`Connected!`),
	onConnectionError: () => console.log(`Disconnected!`)
})

function handler(job, complete, worker) {
	worker.log('Task variables', job.variables)

	// Task worker business logic goes here
	const updateToBrokerVariables = {
		updatedProperty: 'newValue',
	}

	complete.success(updateToBrokerVariables)
}

const zbWorker = zbc.createWorker({
    taskType: 'send-tweet',
    taskHandler: handler,
    onReady: () => console.log(`Worker connected!`),
    onConnectionError: () => console.log(`Worker disconnected!`)
})

