
export enum state {
    PENDING,
    LIVE,
    DONE
}

export type User = {
    id: number;
    name: string;
}

export type Show = {
    id: number;
    userId: number;
    name: string;
    state: state;
    schedule: number;
    currentProductId: number | null;
}

export type Product = {
    id: number;
    showId: number;
    name: string;
    startingPrice: number;
    expiration: number | null;
    auctionState: state;
    lastBid: Bid | null;
}

export type Bid = {
    productId: number;
    userId: number;
    amount: number;
    expiration: number;
}

export interface hasName {
    name: string;
}

export interface hasUserId {
    userId: number;
}

export interface hasShowId {
    showId: number;
}

export interface hasProductId {
    productId: number;
}

export interface hasStartingPrice {
    startingPrice: number;
}

export interface hasAmount {
    amount: number;
}

export interface hasSchedule {
    schedule: number;
}

export interface hasAuctionUpdate {
    auctionUpdate: Bid;
}