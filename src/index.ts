import http from 'http';
import express from "express";
import {execute, subscribe} from 'graphql';
import { graphqlHTTP } from "express-graphql";
import {makeExecutableSchema} from '@graphql-tools/schema'
import {SubscriptionServer} from 'subscriptions-transport-ws';

import {typeDefs} from './Schema/typeDefs';
import {resolvers} from './Schema/resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true,
}));

const httpServer = http.createServer(app);

httpServer.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');

  SubscriptionServer.create(
    {
      execute,
      subscribe,
      rootValue: resolvers,
      schema: typeDefs
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  )
});

