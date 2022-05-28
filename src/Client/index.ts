import "./index.scss";
import $ from "jquery";

import { createClient } from 'graphql-ws';
//import {autoIndent} from './autoIndent';

const strhash = (input: string) => {
	let hash = 0, i, chr;
	if (input.length === 0) return hash.toString(16);
	for (i = 0; i < input.length; i++) {
		chr = input.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash.toString(16);
};

const client = createClient({
  url: 'ws://localhost:4000/subscriptions',
});

client.subscribe(
	{
		query: "subscription { auctionUpdate(productId: 0) {amount} }",
	},
	{
		next: (data) => console.log(`Subscription updates : ${JSON.stringify(data)}`),
		error: (err) => console.error(`Subscription client error : ${err}`),
		complete: () => console.log("Subscription terminated!"),
	}
);

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

const addHistBtn = (key: string, req: string) => {
	$("#query-history").append(`
		<span  class="hist-btn" id="hist-btn-${key}" title="${req}">${req.replace(/\s+/g,'')}</span>
	`);
	$(`#hist-btn-${key}`).on('click', (evt) => {
		$("#query").val(queryHist[key]);
	})
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
		queryHist[key] = req;
		localStorage.setItem('queryHist', JSON.stringify(queryHist));
		addHistBtn(key, req);
	}
}

$("#query-btn").on('click', (evt) => {
	const req = $("#query").val()?.toString() || '';
	$.ajax({
		url: "/graphql",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify({
			query: req,
            variables: { }
		}),
		success: (resp) => {
			addHist(req);
			const data = JSON.stringify(resp, null, 4);
			$("#response").text(data);
		},
	});
});

