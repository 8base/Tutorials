<style scoped>
/**
 * Some of the styling is functional, while other
 * is aesthetic. Feel free to play with it!
 */
* {
  font-family: Arial, Helvetica, sans-serif;
}

section {
  overflow-y: scroll;
  margin: 0 auto;
  height: 736px;
  width: 414px;
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
   * any parent component (the ones in Dev.vue).
   */
  props: {
    query: {
      type: String,
      required: true
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
      default: ''
    }
  },
  data() {
    return {
      /* An array for storing all records fetched */
      items: [],
      /**
       * Configure the GraphQL Client, setting the 
       * authToken only if specified.
       */
      client: new GraphQLClient(this.endpoint, (this.authToken ? {
        headers: {
          authorization: `Bearer ${this.authToken}`
        }
      } : null))      
    };
  },
  methods: {
    /**
     * Callback from onscroll event checks whether the scroll position
     * is at the bottom of the scroll container.
     */
    handleScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) this.loadBatch();
    },
    /**
     * When a new batch of articles are retrieved from the
     * API, add them to the items array and increase the index
     * by 1.
     */
    handleLoad({ articlesList }) {
      this.items = this.items.concat(articlesList.items);
    },
    /**
     * Use the client to send query to GraphQL API
     * with the needed variables, 'first' and 'skip'.
     */
    loadBatch() {
      this.client
        .request(this.query, {
          skip: this.items.length,
          limit: this.limit        
        })
        .then(this.handleLoad)
        .catch(console.error);
    }
  },
  /**
   * When the component mounts, load the
   * initial batch of posts.
   */
  mounted() {
    this.loadBatch();
  }
};
</script>
