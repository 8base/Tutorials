import WebSocket from "isomorphic-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";

const {
  VUE_APP_8BASE_WS_ENDPOINT: wssEndpoint,
  VUE_APP_8BASE_WORKSPACE_ID: workspaceId,
} = process.env;

/* Create the subscription client */
const subscriptionClient = new SubscriptionClient(
  wssEndpoint,
  {
    lazy: true,
    reconnect: true,
    /* Generates the WSS connection params */
    connectionParams: () => ({ workspaceId }),
  },
  WebSocket,
  []
);

export default {
  /* Public method for running subscription */
  subscribe: (query, options) => {
    const { variables, data, error } = options;

    const result = subscriptionClient.request({
      query,
      variables,
    });

    const { unsubscribe } = result.subscribe({
      next(result) {
        if (typeof data === "function") {
          data(result);
        }
      },
      error(e) {
        if (typeof error === "function") {
          error(e);
        }
      },
    });

    return unsubscribe;
  },

  /* Close client connection */
  close: () => {
    subscriptionClient.close();
  },
};