# (IN PROGRESS - NOT COMPLETE) Building an Infinite Scroll Component using VueJS and GraphQL
It's hard to think of a web or mobile application in 2019 that doesn't have at least one feed or list component. Whether it's for a news feed, search results page, or tabbed-out list of resources, different methods of pagination are constantly being used. One of the most popular pagination experiences is the infamously addictive **Infinite Scroll**.

Before we jump into building an infinite scroll component, let's answer one question. *Why is infinite scroll – or pagination in general – useful?* 

Imaging that you're working on a popular news app. There are 10,000's of articles in the archives and dozens being published everyday. The news feed in your app sorts articles by publishing date so that the newest appear first. However, sorted or now, if the feed loaded **ALL** articles every time a user opened their app, the **infinite scroll feed would instead be an infinite load feed** and everyone would be sad.

This is where pagination, in its various forms, comes to save the day. Instead of your feed having to load **ALL** of the news, it's able to quickly request, for example, the 25 most recent articles. Then when the user requests more the feed will fetch articles 26 through 50 and so on. This makes sure that response times are quick and there is never too much data being needlessly transfered.

## Getting Started
So with all of that babel in mind, let's actually build an infinite scroll component using VueJS and a GraphQL API. You'll likely be able to re-use the final component in any of your VueJS projects, so think of it as a new tool in the toolbox once done!

## Prerequisites
This tutorial assumes that you are:

1. Somewhat familiar with Vue
2. Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/lang/en/)
3. Have [Node](https://nodejs.org/en/) installed on your computer
4. Are excited about playing with GraphQL!

## Using Vue instant prototyping
The most under-valued and epic (in my humble opinion) Vue feature is [instant prototyping](https://cli.vuejs.org/guide/prototyping.html). What does that mean? It means that without having to set up an entire Vue project you can develop a single component in isolation when using the CLI. 

We can almost immediately jump into developing our component by using it, so let's install it during our short set up section.

## Installing the CLI and dependences
First we're going to install the Vue CLI and an extra extension package that gives us the ability to use instant prototyping.

```bash
# Install Vue CLI
npm install -g @vue/cli
# Install the CLI instant prototyping
npm install -g @vue/cli-service-global
```

Next, create a new directory on your computer and call it whatever you'd like. In here we'll write all the code for our component.

```bash
# Create new directory
mkdir infinite-scroll-component
# Change into new directory
cd infinite-scroll-component
```

Let's now initilize a new NPM project. Just accept all the defaults before installing the project's dependencies and adding the needed files. We're going to have an extremely lean `package.json` file that only has two dependencies; one for GraphQL requests and the other is Vue.

```bash
# Init new npm project and accept all defaults
npm init
# Install dependencies
npm install --save vue graphql-request
# Create the component files
touch Dev.vue InfiniteScroll.vue
```

Voila! If only setup was always that easy... With instant prototyping we can now run `vue serve FILE_NAME` and it will spin up the development server for that single file. Try it! You will probably be... potentially underwhelmed since our files are still empty 🙃

That said, before we start writing our Vue components we're going to setup the GraphQL API. Why? Because it is **SO MUCH MORE FUN** developing when there's data. Hopefully you agree!

## Setting up a GraphQL API on 8base
There are many different ways to accomplish setting up a GraphQL server and API. However, we'll use 8base so that everything is extremely quick to set up and super stable. To get started, we'll only need to take the following four steps.

##### 1) Sign Up
If you have an existing account, visit your 8base [Dashboard](https://app.8base.com) and select an existing **Workspace**. If you don’t have an account, create one on [8base](https://8base.com/). Their free plan will work for what we need.

##### 2) Building the Data Model
In the workspace, navigate to the [Data Builder](https://app.8base.com/data/) page and click on “+ Add Table” to start building the data model. Were going to create just one called `Articles` with the following fields.

**Articles**
| Field | Type | Description | Options |
| ----- | ---- | ----------- | ------- |
| `title` | Text | Article title | `mandatory=True` |
| `body` | Text | Article body | `mandatory=True`, `characters=1000` |

Before movin on, let's add some dummy records to our database. I've included a CSV file here called [Dummy Data for 8base + Vue InfiniteScroll Tutorial](ddhd). Download it and navigate to the `Data` tab that's right next to the `Schema` tab in your *Data Builder*. 

On the far right of the *Data Viewer* there is a dropdown with an *Import CSV* option. Click it, select the dummy data file, and make sure to specify "Has headers". You'll need to map the column names to the appropriate table fields. However, once done, the import should only take a few seconds.

##### 3) Roles and Permissions
Remember how we specified that our component could accept an `authToken` parameter? We're going to use that feature to help secure our API. To allow our app to securely access the 8base GraphQL API with appropriate permissions, were going to create an API Token with a custom role. Navigate to `Settings > Roles` and create new role with the name "FeedAppClientRole". Once created, click the role and let's update its permissions. 

Here we can update what permissions the FeedAppClientRole is allowed to perform. In our case, we ONLY want it to be able to query/read articles. Let's check the appropriate boxes and select the needed options.

**FeedAppClientRole Permissions**
| Table | Create | Read | Update | Delete | Fields |
| ----- | ------ | ---- | ------ | ------ | ------ |
| Articles | False | All Records | False | False | *Defaults |

Now, we need to attach this role to an API Token that can be included in our app. Navigate to [`Settings > API Tokens`](https://app.8base.com/settings/api-tokens) and add a new token be specifying a name – any name – and selecting the FeedAppClientRole that we just created. 

Make sure to copy the role! You won't be able to view it again. For now, just add it as the `authToken` value in `Index.vue`.

##### 4) Getting the Workspace API Endpoint
Finally, let’s copy our workspace’s API endpoint. This endpoint is unique to our workspace and is where we will send all of our GraphQL queries for new records. 

There are a few ways to obtain the endpoint. However, just navigate to the workspace **Home** page and you’ll find the endpoint in the bottom left. Similarly to the `authToken`, add this value to the `endpoint` value in `Index.vue`.

## Setting up the component
So let's quickly list out what our `InfiniteScroll` component is going to have to do. That way, we'll be able to think more clearly about the steps we need to take.

**Simple Spec**
* Query a GraphQL endpoint for *N* many record.
* Allow the user to scroll vertically through a rendered list.
* Recognize when the user has reached the end of the list.
* Query *N* additional records and append them to the list.
* Allow for the developer to specify a template for list items.

With these bullets in mind, let's add some templates to our files so that we have a structure to work off of. The reason that we have both an *Dev* and *InfiniteScroll* file is so we can import the scroll component being developed. This way, we'll be able to interact with it the same way we would in a full application.

### `Dev.vue`
So first, let's setup the `Dev.vue` file.

##### <template>
Per the simple spec, we want a `InfiniteScroll` component that fetches a specified number of records from a GraphQL API. Additionally, we want to be able to specify a template that will get rendered for each record that's fetched.

With that in mind, let's create an example of **how we'd like to use our component** by writing out the `<template>` tag of the file. Always read to in-code comments!

```html
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

<!-- 
  Next up... <script> will go here 
-->
```

Sweet! We've essentially just wrote out how we'd like to use our `InfiniteScroll` component. It looks pretty intuitive and easy to use, right? Now we have to **ACTUALLY BUILD IT**... Before that though, let's add the `<script>` tag to our `Dev.vue` file so that we have all the named attributes are present and have appropriate values.

Just place the following code right below the `<template>` tag and then read the comments!

```html
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
            query: `query($first: Int, $skip: Int) {
                articlesList(first: $first, skip: $skip) {
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
```

Nice work! Our `Dev.vue` component is set up. We'll need to update some of the data values soon; so hold tight!

### `InfiniteScroll.vue`
Now it's time for the actual `InfiniteScroll` component. Similarly to the last component, let's start with the `<template>` tag. Additionally, we're going to throw if a `<style>` tag with the template, as infinite scroll does require some functional styling.

```html
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

<!-- 
  Next up... <script> will go here 
-->
```

I know. It's almost frustratingly simple, right? However, why make something more complex than it has to be? All we want to do is render out every record fetched from our API, as well as know when to fetch more. 

So, let's now add our `<script>` tag which will make all of this possible.

```html
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
     * When a new batch of articles are retrieved from the API, 
     * add them to the items.
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
          limit: this.limit,
          skip: this.items.length
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
```

Naturally, the part just added is a little bit meatier. That said, there are really only several things worth pointing out – as the in-code documentation should handle the rest.

First off, we initialize the `GraphQLClient` and conditionally pass it an options object depending on whether or not an `authToken` was given as a prop. The initialized client is what gets used in the `loadBatch` method to execute GraphQL calls to our API. It uses the required `query` prop, which can use the following `skip` and `limit` variables.

The `skip` and `limit` variables are what are query use to navigate the paginated results. While `limit` simply represents *how many records to load per request*, `skip` specifies *how many records have already been loaded*. Thus, if we initially fetch records `A`, `B`, and `C` from our API with `limit = 3, skip = 0`, and then on the following request specify `limit = 3, skip = 3`, we'll recieve records `D`, `E`, and `F`.

Lastly, let's look at the `handleScroll` method. This is that callback method for the `@scroll` event. By unpacking the passed `event` argument we get access to the `scrollTop`, `clientHeight`, and `scrollHeight` values. The `clientHeight` is a fixed value that represents the height of the scrollable element in pixels. Meanwhile, `scrollTop` is changing on every scroll event to represent the distance from the top of the scroll container to the current position. If the `clientHeight` plus `scrollTop` is equal to or greater than the `scrollHeight` – scrollable height of element in pixels – then we know the container has been fully scrolled to the bottom!

To answer the first question or item in mind (`endpoint`), we're going to need a GraphQL API that can return us articles. Let's take that step now before continuing on with our component.

🎉 Our pagination component is ready! You can see the full source code for this component in this Codepen.