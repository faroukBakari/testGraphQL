import "./demo.scss";
import $ from "jquery";

import { createClient } from 'graphql-ws';

const httpGrphQLReq = (req: string, callback: Function) => {
	$.ajax({
		url: "/graphql",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify({
			query: typeof req === 'string' ? req : JSON.stringify(req),
            variables: { }
		}),
		success: (resp) => callback(resp),
	});
}


let client = createClient({
	url: "ws://localhost:4000/subscriptions",
	keepAlive: 5000,
	shouldRetry: () => true,
	retryWait: async (nbRetries) => await new Promise((resolve) =>
		setTimeout(resolve, 1000 + Math.random() * 3000),
	),
	// connectionAckWaitTimeout: 1000,
	// lazy: false,
	on: {
		opened() {
			console.log('subs websocket opened!');
		},
		connected() {
			console.log('subs websocket connected!');
		},
		closed(err) {
			console.log('subs websocket disconnected with reason : ' + (err as CloseEvent).reason);
		}
	}
});




console.log('demo page');
