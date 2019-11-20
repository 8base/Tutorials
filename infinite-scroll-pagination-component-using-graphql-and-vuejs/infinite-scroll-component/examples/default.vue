<style scoped>
* {
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  margin: 0 auto;
  width: 420px;
}
</style>

<template>
    <!-- 
      Here's our InfiniteScroll component. We want to pass it some simple
      props so that the component knows... 
        
      1) query: The GraphQL query to run. 
      2) limit: How many records to fetch.
      3) respKey: A key for accessing the response.
      4) endpoint: Where to fetch the records from.
      5) authToken: If needed, a token to access the API.
     -->
     <section class="container"> 
      <InfiniteScroll 
          :query="query"
          :limit="limit" 
          :respKey="respKey" 
          :endpoint="endpoint" 
          :authToken="authToken">
          <!-- 
            Instead of being stuck with a generic template, we want to
            be able to render out each record that gets fetched with a
            custom template. 
            
            1) Using v-slot we can name the scoped data that's passed to the template.
            2) The template is a child component of InfiniteScrollm so we can access it using <slot />
          -->
          <template v-slot="item">
              <!-- 
                Using the scoped slot data, we're creating a simple template 
                that will render out the wanted data from our fetched records.
                -->
              <article>
                <h4>{{ item.title }}</h4>
                <p>{{ item.body }}</p>
              </article>
          </template>
      </InfiniteScroll>
    </section>
</template>

<script>
/**
 * We've got to import our infinite scroll component! 
 */
import { InfiniteScroll } from 'infinite-scroll-component';

export default {
    /**
     * Registering the component will allow us to
     * use it in our template, as is shown above.
     */ 
    components: {
        InfiniteScroll
    },
    data() {
        return {
            /**
             * Here we've adding the values to that are
             * getting passed to the InfiniteScroll
             * comonent. They could be directly added in, 
             * the template, though are better organized
             * in the data method like this.
             */
            limit: 25,
            /**
             * Depending on the API, the returned records may be
             * nested in the response object. This key is optional
             * though can be used for accessing a nested list.
             */
            respKey: 'articlesList.items',
            /**
             * Optional auth token, depending on GraphQL API
             * REPLACE IT WITH YOUR API TOKEN
             */ 
            authToken: 'YOUR API TOKEN',
            /**
             * Required GraphQL API endpoint from where records get fetched.
             * REPLACE IT WITH YOUR WORKSPACE API ENDPOINT
             */
            endpoint: 'WORKSPACE API ENDPOINT',
            /**
             * Required GraphQL query for fetching records. This query
             * is designed for our 8base API and will return the paginated
             * results from our articles table.
             */
            query: `query($limit: Int, $skip: Int) {
                articlesList(first: $limit, skip: $skip) {
                    items {
                        id
                        title
                        body
                    }
                }
            }`
        }
    }
};
</script>
