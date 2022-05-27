import http from 'http';
import express from "express";
import {graphql} from 'graphql';

import {schema} from './Schema/schema';
import {rootValue} from './Schema/rootValue';

const app = express();
// const staticMiddleware = express.static("src/Client");

//----------------------------------------------
import webpack from 'webpack';
import webpackConfig from './Client/webpack.config';
import webpackDevMidlewareFactory from 'webpack-dev-middleware';
const compiler = webpack(webpackConfig);
const webpackDevMidleware = webpackDevMidlewareFactory(compiler, webpackConfig.devServer);
app.use(webpackDevMidleware);
//----------------------------------------------

// app.use(staticMiddleware);
app.use('/graphql', (req, res, next) => graphql({ schema, rootValue, source: req.body }).then(resp => res.send(resp)));

const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});

