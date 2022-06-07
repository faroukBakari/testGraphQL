import "./graphql-client.scss";
import $ from "jquery";

import { createClient } from 'graphql-ws';

const HIST_LIMIT = 12;

const strhash = (input: string) => {
	let hash = 0, i, chr;
	if (input.length === 0) return hash.toString(16);
	for (i = 0; i < input.length; i++) {
		chr = input.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0;
	}
	return hash.toString(16);
};

const textarea :HTMLTextAreaElement | null  = document.querySelector('#query');
textarea?.addEventListener('keydown', (e) => {
  if (e.keyCode === 9) {
    e.preventDefault()
    textarea.setRangeText( '  ', textarea.selectionStart, textarea.selectionStart, 'end');
  }
  if (e.key === '{') {
    e.preventDefault()
    textarea.setRangeText( '{}',  textarea.selectionStart, textarea.selectionStart );
	textarea.setSelectionRange(textarea.selectionStart + 1, textarea.selectionStart + 1);
  }
  if (e.key === '[') {
    e.preventDefault()
    textarea.setRangeText( '[]',  textarea.selectionStart, textarea.selectionStart );
	textarea.setSelectionRange(textarea.selectionStart + 1, textarea.selectionStart + 1);
  }
})

const queryHist:  { [key: string]: string } = JSON.parse(localStorage.getItem('queryHist') || "{}");
const threshold = Object.keys(queryHist).length - HIST_LIMIT;
Object.keys(queryHist).map((key, idx) => idx < threshold && delete queryHist[key]);
const addHistBtn = (key: string, req: string) => {
	$("#query-history").prepend(`
		<span  class="hist-btn" id="hist-btn-${key}" title="${req}">${req.replace(/\s+/g,'')}</span>
	`);
	$(`#hist-btn-${key}`).on('click', () => $("#query").val(queryHist[key]))
	$(`#hist-btn-${key}`).on('contextmenu', (evt) => {
		evt.preventDefault();
		delete queryHist[key];
		$(`#hist-btn-${key}`).remove();
		localStorage.setItem('queryHist', JSON.stringify(queryHist));
	})
}
Object.keys(queryHist).forEach((key, idx, self) => {
	addHistBtn(key, queryHist[key]);
	if (idx === self.length - 1) {
		$("#query").val(queryHist[key]);
	}
});
const addHist = (req: string) => {
	const key = strhash(req);
	if (!(key in queryHist)) {
		console.log(`Saving request : ${req.replace(/\s+/g,'')}`);
		const keys = Object.keys(queryHist);
		if (keys.length >= HIST_LIMIT) {
			$(`#hist-btn-${keys[0]}`).remove();
			delete queryHist[keys[0]];
		}
		queryHist[key] = req;
		localStorage.setItem('queryHist', JSON.stringify(queryHist));
		addHistBtn(key, req);
	}
}

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

$("#query-btn").on('click', (evt) => {
	const req = $("#query").val()?.toString() || '';
	httpGrphQLReq(req, (resp: unknown) => {
		addHist(req);
		const data = JSON.stringify(resp, null, 4);
		$("#response").text(data);
	});
});

const appendSubUpdates = (data: Object) => {
	console.log(`Subscription updates : ${data}`);
	const time = new Date().toLocaleString("fr-FR");
	$("#sub-updates").append(`
	  <div class="update">
		  <span class="time">${time}</span>
		  <span class="data">${data}</span>
	  </div>
	  `);
};

let isWSLive = false;
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
			isWSLive = true;
			console.log('subs websocket connected!');
			appendSubUpdates('subs websocket connected!');
		},
		closed(err) {
			console.log('subs websocket disconnected with reason : ' + (err as CloseEvent).reason);
			appendSubUpdates('subs websocket disconnected with reason : ' + (err as CloseEvent).reason);
			$("#sub-selecter input[type='checkbox']").prop( "checked", false );
			isWSLive = false;
		}
	}
});

const subscritions = {};
type type = {kind: string, name?: string, fields?: [ {name: string, type?: type }], ofType?: type};
type gqlEndPoint = { fields: [ {name: string, args?: [{name: string}], type?: type } ]};
type gqlSchema = {
	__schema : {
		queryType? : gqlEndPoint,
		mutationType? : gqlEndPoint,
		subscriptionType? : gqlEndPoint
	}
}

httpGrphQLReq(
	`#graphql
{
	__schema {
	  queryType {
		fields {
			name
			type {
				kind
				name
				fields {
					name
				}
			}
			args {
			name
			type {
				kind
				name
				ofType {
					kind
					name
					fields {
						name
					}
				}
			}
			}
		}
	  }
	  mutationType {
		fields {
			name
			type {
				kind
				name
				fields {
					name
				}
			}
			args {
			name
			type {
				kind
				name
				ofType {
					kind
					name
					fields {
						name
					}
				}
			}
			}
		}
	  }
	  subscriptionType {
		fields {
			name
			type {
				kind
				name
				ofType {
					kind
					fields {
						name
						type {
							kind
						}
					}
				}
				fields {
					name
					type {
						kind
					}
				}
			}
			args {
				name
				type {
					kind
					name
					ofType {
						kind
						name
						fields {
							name
						}
					}
				}
			}
		}
	  }
	}
  }
`,
	(resp: { data: gqlSchema }) => {
		// console.log(JSON.stringify(resp, null, 4));
		resp.data?.__schema?.subscriptionType?.fields.length && $('#server-subscriptions').show();
		resp.data?.__schema?.subscriptionType?.fields.forEach((field) => {
			console.log(JSON.stringify(field.args, null, 4));
			$("#sub-selecter").append(`
		<div class="subscription" id="sub-${field.name}">
			<input type="checkbox">
			<span title="${field.name}">${field.name}</span>
			<input
				type="text"
				placeholder="args (a:'',b:''...)"
				title='${JSON.stringify(field.args, null, 4)}'
				${field.args?.length ? "" : "disabled"}
			>
		</div>
		`);
			$(`#sub-${field.name} input[type="checkbox"]`).on("change", (evt) => {
				const doSubscribe = (evt.target as HTMLInputElement | null)?.checked;
				console.log(`#subscription to ${field.name} : ${doSubscribe ? "on" : "off"}`);
				const params = $(`#sub-${field.name} input[type="text"]`).val();
				const query = field.args?.length ? `subscription { auctionUpdate ${params ? `(${params})` : ''} ${
					(field?.type?.kind === "OBJECT")
						? `{${field?.type?.fields?.filter(field => field.type?.kind !== "OBJECT")?.map(field => field.name).toString().replaceAll(',', ' ')}}`
						: (field?.type?.ofType?.kind === "OBJECT")
							? `{${field?.type?.ofType?.fields?.filter(field => field.type?.kind !== "OBJECT")?.map(field => field.name).toString().replaceAll(',', ' ')}}`
							: ''
				} }` : `subscription { auctionUpdate {amount} }`;
				console.log(query);
				client.subscribe({query}, {
						next: (data) => appendSubUpdates(JSON.stringify(data)),
						error: (err) => appendSubUpdates(`Error : ${JSON.stringify(err)}`),
						complete: () => appendSubUpdates("Subscription terminated!"),
					}
				);
			});
		});
	}
);