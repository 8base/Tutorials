<template>
    <!-- 
      Here's our InfiniteScroll component. We pass it some simple
      props so that the component know... 
        
      1) query: The needed GraphQL query. 
      2) limit: How many records to fetch.
      3) endpoint: Where to fetch the records from.
      4) authToken: If needed, a token to access the API.
     -->
    <InfiniteScroll 
        :query="query"
        :limit="limit" 
        :endpoint="endpoint" 
        :authToken="authToken">
        <!-- 
          Instead of being stuck with a generic template, we want to
          be able to render out each record that gets fetched with a
          custom template. 
          
          1) Using v-slot we can name the scoped data.
          2) Passing the template as a child access to it in the InfiniteScroll component
         -->
        <template v-slot="item">
            <article>
              <!-- 
                Using the scoped slot data, we're creating a simple template 
                that will render out the wanted data from our fetched records.
               -->
              <h4>{{ item.title }}</h4>
              <p>{{ item.body }}</p>
            </article>
        </template>
    </InfiniteScroll>
</template>

<script>
/**
 * We've got to import our infinite scroll component! 
 */
import InfiniteScroll from './InfiniteScroll.vue';

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
            /* Optional auth token, depending on GraphQL API */ 
            authToken: 'd81c8730-8027-4751-802d-6a301e5fc26e',
            /* Required API endpoint for where records get fetched from */
            endpoint: 'https://api.8base.com/ck24vgl0p001q01l2147o1jku',
            /* Required GraphQL query for fetching records */
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