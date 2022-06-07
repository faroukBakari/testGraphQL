import http from 'http';
import express from "express";
import bodyParser from 'body-parser';
import {graphql} from 'graphql';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/lib/use/ws";


const app = express();
app.use(bodyParser.json())

import {typeDefs} from './Schema/typeDefs';
import {resolvers} from './Schema/resolvers';
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.post('/graphql', (req, res) => {
  graphql({ schema, rootValue: {}, source: req.body.query })
    .then(resp => {
      res.send(resp)
    })
    .catch(err => {
      console.error(JSON.stringify(err, null, 4));
      res.send(err)
    })
});

const httpServer = http.createServer(app);

//----------------------------------------------
const wss = new WebSocketServer({
  server: httpServer,
  path: "/subscriptions"
});
useServer({
  schema,
  onConnect: async (ctx) => {
    console.log(`new incomming connection from ${ctx.extra.request.socket.remoteAddress}`);
  },
  onDisconnect(ctx, code, reason) {
    console.log(`<${ctx.extra.request.socket.remoteAddress}> disconnected with code ${code} / reason = ${reason}`);
  }
}, wss);
//----------------------------------------------

httpServer.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});

export default app;