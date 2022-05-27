import http from 'http';
import express from "express";
import bodyParser from 'body-parser';
import {graphql} from 'graphql';

const app = express();
app.use(bodyParser.json())
// const staticMiddleware = express.static("src/Client");
// app.use(staticMiddleware);

//----------------------------------------------
import webpack from 'webpack';
import webpackConfig from './Client/webpack.config';
import webpackDevMidlewareFactory from 'webpack-dev-middleware';
const compiler = webpack(webpackConfig);
const webpackDevMidleware = webpackDevMidlewareFactory(compiler, webpackConfig.devServer);
app.use(webpackDevMidleware);
//----------------------------------------------

import {schema} from './Schema/schema';
import {rootValue} from './Schema/rootValue';

app.post('/graphql', (req, res, next) => {

  // console.log(req.body);
  
  graphql({ schema, rootValue, source: req.body.query })
    .then(resp => {
      console.log(resp);
      res.send(resp)
    })
    .catch(err => {
      console.error(err);
      res.send(err)
    })
});

const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});

