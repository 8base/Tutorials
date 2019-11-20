<style scoped>
/**
 * Some of the styling is functional, while other
 * is aesthetic. Feel free to play with it!
 */
section {
  overflow-y: scroll;
  height: 500px;
}
</style>

<template>
  <!-- 
    Component container with scroll event listener
    for triggering handle scroll event.
  -->
  <section @scroll="handleScroll">
    <!--
      For every item in the items array, render
      the slotted template and bind the item data.
     -->
    <slot v-for="item in items" v-bind="item" />
  </section>
</template>

<script>
/* eslint-disable no-console */

/* Imports the graphQL request client */
import { GraphQLClient } from "graphql-request";

export default {
  /**
   * Declare the props expected to be passed from
   * any parent component.
   */
  props: {
    query: {
      type: String,
      required: true
    },
    respKey: {
      type: String,
      default: ""
    },
    limit: {
      type: Number,
      default: 25
    },
    endpoint: {
      type: String,
      required: true
    },
    authToken: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      /* The array for storing all records fetched */
      items: [],
      /**
       * Configure the GraphQL Client, setting headers
       * only if the authTokenis specified.
       */
      client: new GraphQLClient(
        this.endpoint,
        this.authToken
          ? {
              headers: {
                authorization: `Bearer ${this.authToken}`
              }
            }
          : null
      )
    };
  },
  computed: {
      respKeyParser() {
          return this.respKey.split('.')
      }
  },
  methods: {
    /**
     * Callback for the onscroll event checks whether the scroll position
     * is near the bottom of the scroll container.
     */
    handleScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) this.loadBatch();
    },
    /**
     * When a new batch of articles are retrieved from the API,
     * add them to the items.
     */
    handleLoad(response) {
      if (this.respKey) {
          response = this.respKeyParser.reduce((o, v) => o[v], response)
      }
      this.items = this.items.concat(response);
    },
    /**
     * Use the client to send query to GraphQL API
     * with the needed variables, 'limit' and 'skip'.
     */
    loadBatch() {
      this.client
        .request(this.query, {
          limit: this.limit,
          skip: this.items.length
        })
        .then(this.handleLoad)
        .catch(console.error);
    }
  },
  /**
   * When the component mounts (first renders), load the
   * initial batch of posts.
   */
  mounted() {
    this.loadBatch();
  }
};
</script>
