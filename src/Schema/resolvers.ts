import Show from "./show";
import User from "./user";
import Product from "./product";
import {state} from "./state";
import dataService from "./dataService";

import { PubSub, withFilter } from "graphql-subscriptions";
import internal from "stream";
const pubsub = new PubSub();
const subTopics = {
	BID_UPDATE: "BID_UPDATE",
};

const auctionTimers = new Map<number, NodeJS.Timeout>();

const resolvers = {
	Query: {
		getUsers(): User[] {
			return dataService.getTable("users") as User[];
		},
		getShows(): Show[] {
			return dataService.getTable("shows") as Show[];
		},
		getProducts(): Product[] {
			return dataService.getTable("products") as Product[];
		},
		getShowProducts(_: Object, input: { showId: number }) {
			return dataService.filterTable("products", (obj) => (obj as Product).getShowId() === input.showId) as Product[];
		},
	},
	Mutation: {
		createUser(_: unknown, input: { name: string }) {
			const newSeller = dataService.insertTableRow("users", { name: input.name }) as User;
			return newSeller;
		},
		createShow(_: Object, input: { name: string; userId: number; schedule: number }) {
			const newShow = dataService.insertTableRow("shows", { ...input, state: state.PENDING, currentProductId: null }) as Show;
			return newShow;
		},
		addProduct(_: Object, input: { name: string; showId: number; startingPrice: number }) {
			const newProduct = dataService.insertTableRow("products", { ...input, auctionState: state.PENDING, expiration: null, lastBid: null }) as Product;
			return newProduct;
		},
		startShow(_: Object, input: { showId: number }) {
			const show = new Show(dataService.getTableRow("shows", input.showId) as Show);
			show.start();
			return dataService.updateTableRow("shows", show);
		},
		startAuction(_: Object, input: { productId: number }) {
			const product = new Product(dataService.getTableRow("products", input.productId) as Product);
			product.startAuction(60000);
			auctionTimers.set(product.getId(), setTimeout(() => {
				product.endAuction();
				dataService.updateTableRow("products", product);
				pubsub.publish(subTopics.BID_UPDATE, { auctionUpdate: product });
			}, product.getExpiration() -  Date.now()));
			console.log("Publishing auction start for productId " + input.productId);
			pubsub.publish(subTopics.BID_UPDATE, { auctionUpdate: product });
			return dataService.updateTableRow("products", product);
		},
		placeBid(_: Object, input: { productId: number; userId: number; amount: number }) {
			const product = new Product(dataService.getTableRow("products", input.productId) as Product);
			product.placeBid(input.userId, input.amount, 15000);
			console.log("Publishing new bid for productId " + input.productId);
			pubsub.publish(subTopics.BID_UPDATE, { auctionUpdate: product });
			clearTimeout(auctionTimers.get(product.getId()));
			auctionTimers.set(product.getId(), setTimeout(() => {
				product.endAuction();
				dataService.updateTableRow("products", product);
				pubsub.publish(subTopics.BID_UPDATE, { auctionUpdate: product });
			}, product.getExpiration() -  Date.now()));
			return dataService.updateTableRow("products", product);
		},
	},
	Subscription: {
		auctionUpdate: {
			subscribe: withFilter(
				() => pubsub.asyncIterator([subTopics.BID_UPDATE]),
				(payload: { auctionUpdate: Product }, filter: { productId: number }) => {
					console.log(`subscribtion filter => lastBid : ${payload.auctionUpdate.getId()} / filter : ${filter.productId})`);
					return payload.auctionUpdate.getId() === filter.productId;
				}
			),
		},
	},
};

export { resolvers };
