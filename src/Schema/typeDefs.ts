import { buildSchema } from "graphql";
const typeDefs = buildSchema(`#graphql
    # Types
    scalar Timestamp
    type User {
        id: ID!
        name: String!
    }
    type Show {
        id: ID!
        userId: Int!
        name: String!
        state: Int!
        schedule: Timestamp!
        currentProductId: Int
    }
    type Product {
        id: ID!
        showId: Int!
        name: String!
        startingPrice: Float!
        expiration: Timestamp
        auctionState: Int!
        lastBid: Bid
    }
    type Bid {
        productId: Int!
        userId: Int!
        amount: Float!
        expiration: Timestamp!
    }
    # Queries
    type Query {
        getUsers: [User]
        getShows: [Show]
        getProducts: [Product]
        getShowProducts(showId: Int!): [Product]
    }
    # Mutations
    type Mutation {
        createUser(name: String!): User
        createShow(userId: Int!, name: String!, schedule: Timestamp): Show
        addProduct(showId: Int!, name: String!, startingPrice: Float!): Product
        startShow(showId: Int!): Show
        startAuction(productId: Int!): Product
        placeBid(productId: Int!, userId: Int!, amount: Float!): Product
    }
    # Subscriptions
    type Subscription {
        auctionUpdate(productId: Int!): Product
    }

    # Schema
    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }

`);

/* pour utiliser les subscription avec graphql, on va avoir besoin de graphql-subscriptions et subscriptions-transport-ws
on va aussi devoir importer et utiliser des composants {execute, subscribe} de graphql

A suivre demain */

export {typeDefs};