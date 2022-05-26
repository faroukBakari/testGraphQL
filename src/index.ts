import http from 'http';
import express from "express";
import {graphql} from 'graphql';

import {schema} from './Schema/schema';
import {rootValue} from './Schema/rootValue';


const app = express();

app.use('/graphql', (req, res, next) => {
  graphql({ schema, rootValue, source: req.body }).then((result) => {
    res.send(result);
  });
})

app.use('/', (_, res) => {
  res.sendFile(__dirname + '/Client/index.html')
})

const httpServer = http.createServer(app);

httpServer.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});

