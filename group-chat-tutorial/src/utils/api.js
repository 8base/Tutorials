import { ApolloClient } from "apollo-boost";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

const { VUE_APP_8BASE_API_ENDPOINT } = process.env;

export default new ApolloClient({
  link: createHttpLink({
    uri: VUE_APP_8BASE_API_ENDPOINT,
  }),
  cache: new InMemoryCache()
});