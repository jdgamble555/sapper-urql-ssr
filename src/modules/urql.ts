import { SubscriptionClient } from "subscriptions-transport-ws";
import * as config from "./../config.json";
import { pipe, mergeMap, map, fromPromise, fromValue } from 'wonka';
import {
  dedupExchange,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
  createClient,
  Exchange,
  Operation,
  makeOperation
} from "@urql/core";
import 'isomorphic-unfetch';
import * as ws from 'ws';
import { getToken } from "./firebase";


const isServerSide = typeof window === "undefined";

const getHeaders = async () => {
  return {
    "X-Auth-Token": await getToken()
  };
};

const subscriptionClient = new SubscriptionClient(`wss://${config.uri}`, {
  reconnect: true,
  lazy: true,
  connectionParams: async () => await getHeaders()
},
  isServerSide ? ws : null
);


// allow for async headers...
const fetchOptionsExchange = (fn: any): Exchange => ({ forward }) => ops$ => {
  return pipe(
    ops$,
    mergeMap((operation: Operation) => {
      const result = fn(operation.context.fetchOptions);
      return pipe(
        typeof result.then === 'function' ? fromPromise(result) : fromValue(result) as any,
        map((fetchOptions: RequestInit | (() => RequestInit)) => {
          return makeOperation(operation.kind, operation, {
            ...operation.context,
            fetchOptions
          });
        })
      );
    }),
    forward
  );
};

const client = createClient({
  url: `https://${config.uri}`,
  exchanges: [
    dedupExchange,
    cacheExchange,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation);
      },
    }),
    fetchOptionsExchange(async (fetchOptions: any) => {
      return {
        ...fetchOptions,
        headers: async () => await getHeaders()
      };
    }),
    fetchExchange,
  ],
});

export default client