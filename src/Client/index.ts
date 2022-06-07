import "./index.scss";
import $ from "jquery";

import { createClient } from 'graphql-ws';
import videojs from 'video.js';

import User from "../Schema/user";
import Show from "../Schema/show";
import Product from "../Schema/product";

const httpGrphQLReq = (query: string, callback: Function) => {
	$.ajax({
		url: "/graphql",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify({
			query,
            variables: { }
		}),
		success: (resp) => {
			if ('errors' in resp) {
				throw new Error(JSON.stringify(resp, null, 4))
			}
			callback(resp.data);
		},
	});
}

const asyncHttpGrphQLReq = async (query: string) => new Promise((resolve) => httpGrphQLReq(query, resolve));


let subClient = createClient({
	url: "ws://localhost:4000/subscriptions",
	keepAlive: 5000,
	shouldRetry: () => true,
	retryWait: async (nbRetries) => await new Promise((resolve) =>
		setTimeout(resolve, 1000 + Math.random() * 3000),
	),
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

const player = videojs('stream-vid', {autoplay: true, preload: "auto", muted: true, responsive: true, fluid: true})
console.log(player.currentDimensions());

const updateDisplay = (input: {user?: User, show?: Show, product?: Product}) => {
	if (input.user) {
		$('#show-seller').html(`Seller : ${input.user.getname()}`);
	}
	if (input.show) {
		$('#show-title').html(`Event : ${input.show.getname()}`);
	}
	if (input.product) {
		$('#auction-state').html(`Auction status : ${input.product.getAuctionState().toLowerCase()}`);
		$('#show-product').html(`Current Product : ${input.product.getname()}`);
		$('#product-price').html(`Current price : ${input.product.getCurrentPrice().toPrecision(3)} $`);
		if (input.product.getAuctionState() !== 'LIVE') {
			$('#auction-timer').html('Timeout in : --');
			$('#bid-btn')[0].setAttribute('disabled', '');
		} else {
			$('#auction-timer').html(`Timeout in : ${Math.round((input.product.getExpiration() - Date.now()) / 1000)} sec`);
			$('#bid-btn')[0].removeAttribute('disabled');
		}
	}
}

const generateShow = async () => {
	let user: User;
	let show: Show;
	let product: Product;

	const createUserQery = `#graphql
		mutation {
			createUser (name: "test-user") { id name }
		}
	`;
	let resp = await asyncHttpGrphQLReq(createUserQery);
	user = new User((resp as {createUser: User}).createUser);
	console.log(user);
	const createShowQery = `#graphql
		mutation {
			createShow (
				name: "test-show"
				userId: ${user.getId()},
				schedule: ${Date.now()}
			) { id userId name state schedule currentProductId }
		}
	`;
	resp = await asyncHttpGrphQLReq(createShowQery);
	show = new Show((resp as {createShow: Show}).createShow);
	console.log(show);
	const addProductQery = `#graphql
		mutation {
			addProduct (
				name: "test-show"
				showId: ${show.getId()},
				startingPrice: 5,
			) { id showId name auctionState startingPrice expiration lastBid {userId amount} }
		}
	`;
	resp = await asyncHttpGrphQLReq(addProductQery);
	product = new Product((resp as {addProduct: Product}).addProduct);
	console.log(product);
	const startAuctionQery = `#graphql
		mutation {
			startAuction (productId: ${product.getId()})
			{ id showId name auctionState startingPrice expiration lastBid {userId amount} }
		}
	`;
	resp = await asyncHttpGrphQLReq(startAuctionQery);
	product = new Product((resp as {startAuction: Product}).startAuction);
	console.log(product);
	const auctionSub = `#graphql
		subscription {
			auctionUpdate (productId: ${product.getId()})
			{ id showId name auctionState startingPrice expiration lastBid {userId amount} }
		}
	`;
	subClient.subscribe({query: auctionSub}, {
			next: (data) => {
				product = new Product((data as {data: {auctionUpdate: Product}}).data.auctionUpdate);
				console.log(product);
				updateDisplay({product});
			},
			error: (err) => console.log(`Error : ${JSON.stringify(err)}`),
			complete: () => console.log("Subscription terminated!"),
		}
	);
	// auction-timer
	const interval = setInterval(() => {
		let timer = Math.round((product.getExpiration() - Date.now()) / 1000);
		if (timer < 0) {
			clearInterval(interval);
			timer = 0;
		}
		$('#auction-timer').html(`Timeout in : ${timer} sec`);
	}, 1000);
	updateDisplay({user, show, product});
	$('#bid-btn').on('click', (evt) => {
		console.log('click');
		
		const placeBidQery = `#graphql
			mutation {
				placeBid (productId: ${product.getId()}, userId: 8, amount: ${product.getCurrentPrice() + 1})
				{ id }
			}
		`;
		asyncHttpGrphQLReq(placeBidQery);
	})
}

generateShow();
