import state from './state'
import Bid from './bid'

export default class Product {
    constructor (data: Product) {
        this.name = data.name;
        this.id = data.id;
        this.showId = data.showId;
        this.startingPrice = data.startingPrice;
        this.auctionState = data.auctionState;
        this.expiration = data.expiration;
        this.lastBid = data.lastBid !== null ? new Bid(data.lastBid) : null;
    };
    
    private id: number;
    private showId: number;
    private name: string;
    private auctionState: state;
    private startingPrice: number;
    private expiration: number | null;
    private lastBid: Bid | null;

    getId() {
        return this.id;
    }

    getShowId() {
        return this.showId;
    }

    startAuction() {
        if (this.auctionState === state.PENDING) {
            this.expiration = Date.now() + 60000;
            this.auctionState = state.LIVE;
            return this;
        } else {
            throw new Error(`product [${this.id}] auction allready started`)
        }
    }
    placeBid(userId: number, amount: number) {
        const now = Date.now();
        console.log(`placeBid(input.productId=${this.id})`);
        const BestAmount = this.lastBid?.getAmount() || this.startingPrice;
        if (this.expiration !== null && now < this.expiration && BestAmount < amount) {
            this.expiration = Math.max(now + 15000, this.expiration);
            this.lastBid = new Bid({userId, amount} as unknown as Bid);
            return this;
        } else {
            if (this.expiration === null) {
                throw new Error(`auction not started`);
           } else if (now >= this.expiration) {
                 throw new Error(`time is up => now : ${now} / lastBidTime : ${this.expiration})`);
            } else {
                 throw new Error(`not enougth => lastBidAmount : ${BestAmount} / amount : ${amount})`);
            }
        }
    }
}