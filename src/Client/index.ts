import "./index.scss";
import $ from "jquery";

// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:4000/subscriptions');

// Connection opened
socket.addEventListener('open', function (event) {
	console.log('websocket opened : waiting for server confirmation...');
});
socket.addEventListener('close', function (event) {
	console.log('websocket connection rejected!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
	console.log(`Message from server <${event.data}>`);
	if (event.data === 'welcome') {
		console.log('websocket successfully connected!');
		socket.send('welcome');
	}
});

$("#query-btn").on('click', (evt) => {
	const req = $("#query").val();
	console.log(req);
	$.ajax({
		url: "/graphql",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify({
			query: req,
            variables: { }
		}),
		success: (resp) => {
			const data = JSON.stringify(resp, null, 4);
			console.log(data);
			$("#response").text(data);
		},
	});
});

