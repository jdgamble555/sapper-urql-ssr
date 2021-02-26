import { SubscriptionClient } from "subscriptions-transport-ws";
import * as config from "./../config.json";

import {
  dedupExchange,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
  createClient
} from "@urql/core";
import 'isomorphic-unfetch';
import * as ws from 'ws';

const isServerSide = typeof window === "undefined";

const subscriptionClient = new SubscriptionClient(`wss://${config.uri}`, {
  reconnect: true,
  lazy: true
},
  isServerSide ? ws : null
);

const client = createClient({
  url: `https://${config.uri}`,
  exchanges: [
    dedupExchange,
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation);
      },
    }),
  ],
});

export default client