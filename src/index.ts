import http from 'http';
import express from "express";
import bodyParser from 'body-parser';
import {graphql} from 'graphql';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/lib/use/ws";


const app = express();
app.use(bodyParser.json())

//----------------------------------------------
// app.use(express.static("src/Client"));
import webpack from 'webpack';
import webpackConfig from './Client/webpack.config';
import webpackDevMidlewareFactory from 'webpack-dev-middleware';
const compiler = webpack(webpackConfig);
const webpackDevMidleware = webpackDevMidlewareFactory(compiler, webpackConfig.devServer);
app.use(webpackDevMidleware);
//----------------------------------------------

import {typeDefs} from './Schema/typeDefs';
import {resolvers} from './Schema/resolvers';
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.post('/graphql', (req, res) => {
  // console.log(req.body);
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
/* wss.on('connection', (socket, req) => {
  const { pathname } = parse(req.url || '');
  console.log(`Incomming connection at ${pathname} from ${req.socket.remoteAddress}`);
  if (pathname !== '/subscriptions') {
    console.log('websocket connection rejected!');
    return socket.close();
  }
  socket.on('message', (data, isBinary) => {
    console.log(`Received message from ${req.socket.remoteAddress} : <${data}>`);
  })
  socket.send('welcome');

}); */
const serverCleanup = useServer({
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