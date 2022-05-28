
import {PubSub, withFilter } from 'graphql-subscriptions';
import * as types from "./types";


const users: types.User[] = [{
    id: 0,
    name: "lol"
}];
const shows: types.Show[] = [{
    id: 0,
    name: "hhhh",
    userId: 0,
    state: 0,
    schedule: 1653182625161,
    currentProductId: null
}];
const products: types.Product[] = [{
    id: 0,
    name: "uuuu",
    showId: 0,
    startingPrice: 5,
    auctionState: 0,
    expiration: null,
    lastBid: null
}];

const pubsub = new PubSub();
const subTopics = {
    BID_UPDATE: "BID_UPDATE"
}

const resolvers = {
	Query: {
		getUsers() {
			console.log(users);
			return users;
		},
		getShows() {
			console.log(shows);
			return shows;
		},
		getProducts() {
			console.log(products);
			return products;
		},
		getShowProducts(_: Object, input: types.hasShowId) {
			const out = products.filter((p) => {
				console.log("p.showId (" + p.showId + ") === input.showId (" + input.showId + ")");

				return p.showId == input.showId;
			});
			console.log(out);
			return out;
		},
	},
	Mutation: {
		createUser(_: Object, input: types.hasName) {
			const newSeller: types.User = {
				id: users.length,
				name: input.name,
			};
			users.push(newSeller);
			console.log(newSeller);
			return newSeller;
		},
		createShow(_: Object, input: types.hasUserId & types.hasName & types.hasSchedule) {
			const newShow: types.Show = {
				id: shows.length,
				userId: input.userId,
				name: input.name,
				state: types.state.PENDING,
				schedule: input.schedule,
				currentProductId: null,
			};
			// we could waste extra computation to check the sellerId first, but does it worth it ?
			shows.push(newShow);
			console.log(newShow);
			return newShow;
		},
		addProduct(_: Object, input: types.hasShowId & types.hasName & types.hasStartingPrice) {
			const newProduct: types.Product = {
				id: products.length,
				showId: input.showId,
				name: input.name,
				startingPrice: input.startingPrice,
				auctionState: types.state.PENDING,
				expiration: null,
				lastBid: null,
			};
			// we could waste extra computation to check the sellerId first, but does it worth it ?
			products.push(newProduct);
			console.log(newProduct);
			return newProduct;
		},
		startShow(_: Object, input: types.hasShowId) {
			if (!shows[input.showId]) return;
			if (shows[input.showId].state === types.state.PENDING) {
				shows[input.showId].schedule = Date.now();
				shows[input.showId].state = types.state.LIVE; // no need for state management. will be inferred from starting timestamp
			}
			return shows[input.showId];
		},
		startAuction(_: Object, input: types.hasProductId) {
			console.log(`startAuction(input.productId=${input.productId})`);
			if (!products[input.productId]) return;
			console.log(products[input.productId]);
			if (products[input.productId].auctionState === types.state.PENDING) {
				products[input.productId].expiration = Date.now() + 6000000;
				products[input.productId].auctionState = types.state.LIVE; // no need for state management. will be inferred from starting timestamp
			}
			return products[input.productId];
		},
		placeBid(_: Object, input: types.hasProductId & types.hasUserId & types.hasAmount) {
			const now = Date.now();
			console.log(`startAuction(input.productId=${input.productId})`);
			const product = products[input.productId];
			console.log(product);
			if (!product || product.expiration === null) return;
			const expiration = product.lastBid?.expiration || product.expiration;
			const BestAmount = product.lastBid?.amount || product.startingPrice;
			if (now < expiration && BestAmount < input.amount) {
				product.lastBid = {
					productId: input.productId,
					userId: input.userId,
					amount: input.amount,
					expiration: Math.max(now + 15000, product.expiration),
				};
                console.log('Publishing new bid for productId ' + product.id);
				pubsub.publish(subTopics.BID_UPDATE, {
					auctionUpdate: product.lastBid,
				});
				return product.lastBid;
			} else {
				if (now >= expiration) {
					console.log(`time is up => now : ${now} / lastBidTime : ${expiration})`);
				}
				if (BestAmount >= input.amount) {
					console.log(`not enougth => lastBidAmount : ${BestAmount} / amount : ${input.amount})`);
				}
			}
		},
	},
	Subscription: {
		auctionUpdate: {
			subscribe: withFilter(
				() => pubsub.asyncIterator(subTopics.BID_UPDATE),
				(lastBid: types.hasAuctionUpdate, filter: types.hasProductId) => {
                    console.log(`subscribtion filter => lastBid : ${lastBid?.auctionUpdate.productId} / filter : ${filter.productId})`);
                    return lastBid?.auctionUpdate.productId === filter.productId;
                }
			),
		},
	},
};

export {resolvers};