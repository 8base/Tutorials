# Building an Infinite Scroll Component using VueJS and GraphQL

It's hard to think of a web or mobile application in 2019 that doesn't have at least one feed or list component. Whether it's for a news feed, search results page, or tabbed-out list of resources, different methods of pagination are constantly being used. One of the most popular pagination experiences is the infamously addictive **Infinite Scroll**.

Before we jump into building an infinite scroll component, let's answer one question. *Why is infinite scroll – or pagination in general – useful?* 

![Infinite phone gif](https://thepracticaldev.s3.amazonaws.com/i/lumpvntr5zfdzahpskqv.gif)

Imagine that you're working on a popular news app. There are 10,000's of articles in the archives and dozens being published every day. The news feed in your app sorts articles by publishing date so that the newest appear first. However, sorted or not, if the feed loads **ALL** articles every time a user opens their app, the **infinite scroll feed would instead be an infinite load feed** and everyone would be sad.

This is where pagination, in its various forms, comes to save the day. Instead of your feed loading **ALL** of the news, it's able to quickly request – for example – the 25 most recent articles. Then when the user requests more news the feed will fetch articles 26 through 50 and so on. This makes sure that response times are quick and there is never too much data being needlessly transferred.

*Rather just play with the code yourself? it's live on CodeSandbox! Feel free to check it out.*

[![Edit Vue + 8base Infinite Scroll Component](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vue-template-1fxp2?fontsize=14&hidenavigation=1&theme=dark)

[Also... here's the GitHub repo](https://github.com/8base/Tutorials/tree/master/infinite-scroll-pagination-component-using-graphql-and-vuejs/infinite-scroll-component)

## Getting Started
So with all of that babel in mind, let's actually build an infinite scroll component using VueJS and a GraphQL API. You'll likely be able to re-use the final component in any of your VueJS projects, so think of it as a new tool in your toolbox once done!

## Prerequisites
This tutorial assumes that you are:

1. Somewhat familiar with [Vue](http://vuejs.org/)
2. Have [Node](https://nodejs.org/en/) installed on your computer
3. Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/lang/en/)
4. You are excited about playing with GraphQL!

## Using Vue instant prototyping
The most under-valued and epic (in my humble opinion) Vue feature is [instant prototyping](https://cli.vuejs.org/guide/prototyping.html). What does that mean? It means that without having to set up an entire Vue project you can develop a single component in isolation. 

This will let us (almost) immediately jump into developing our component, so let's install it during our short set up section.

## Installing the CLI and dependences
First, we're going to install the Vue CLI and an extra extension package that gives us the ability to use instant prototyping.

```bash
# Install Vue CLI
npm install -g @vue/cli
# Install the CLI instant prototyping
npm install -g @vue/cli-service-global
```

Next, create a new directory on your computer and call it whatever you'd like. Here we'll write all the code for our component.

```bash
# Create new directory
mkdir infinite-scroll-component
# Change into new directory
cd infinite-scroll-component
```

Now, we're going to create our component files and an `examples` directory. Why? Because when developing our component we'll want to import/interact with it like we would in a full application. Thus, the `examples` directory will allow us to do just that by requiring our infinite scroll component as a local dependency.

```bash
# This will create the examples directory and all required files
mkdir examples && touch index.js infiniteScroll.vue examples/default.vue
# Your directory should look like this
tree .
=> 
infinite-scroll-component
├── examples
│   └── default.vue
├── index.js
└── infiniteScroll.vue
```

Finally, we're going to want to initialize a new NPM project in **both the root and examples directory**. When doing this, just accept all the defaults before installing the project's dependencies.

```bash
# Init new npm project in ROOT directory
npm init
# Install dependencies
npm install --save vue graphql-request
# Change into examples directory and init new npm project
cd examples && npm init
# Require the infinite scroll component as a local dependency!
npm install --save ..
```

Voila! If only setup was always that easy... 

With instant prototyping we can now run `vue serve FILE_NAME` and it will spin up the development server for that single file. Try it! You will probably be... potentially underwhelmed since our files are still empty 🙃

That said before we start writing our Vue components we're going to set up the GraphQL API. Why? Because it is **SO MUCH MORE FUN** developing when there's data. Hopefully, you agree!

## Setting up a GraphQL API on 8base
There are many different ways to accomplish setting up a GraphQL server and API. However, we'll use 8base so that everything is extremely quick to set up and super stable. To get started, we'll only need to take the following few steps.

##### 1) Sign Up
If you have an existing account, visit your 8base [Dashboard](https://app.8base.com) and select an existing **Workspace**. If you don’t have an account, create one on [8base](https://8base.com/). Their free plan will work for what we need.

##### 2) Building the Data Model
In the workspace, navigate to the [Data Builder](https://app.8base.com/data/) page and click on “+ Add Table” to start building the data model. Were going to create just one called `Articles` with the following fields.

**Articles**

| Field | Type | Description | Options |
| ----- | ---- | ----------- | ------- |
| `title` | Text | Article title | `mandatory=True` |
| `body` | Text | Article body | `mandatory=True`, `characters=1000` |

##### 3) Adding Dummy Data
Let's add some dummy records to our database. I've uploaded a [DummyData.csv](https://raw.githubusercontent.com/8base/Tutorials/master/infinite-scroll-pagination-component-using-graphql-and-vuejs/DummyData.csv) file. Save it and then open the `Data` tab that's right next to the `Schema` tab in the 8base *Data Builder*. 

On the far right of the *Data Viewer* there is a dropdown with an *Import CSV* option. Select the `DummyData.csv` file from your downloads folder and make sure to specify "Has Header Row" in the modal that appears. You might need to map the column names to the appropriate table fields. However, once done, the import should only take a few seconds.

##### 4) Roles and Permissions
To allow our app to securely access the 8base GraphQL API with appropriate permissions were going to create an API Token with a custom role attached. Navigate to [`Settings > Roles`](https://app.8base.com/settings/roles) and create a new role with the name "FeedAppClientRole". Once created, click the role to update its permissions. 

Here we can update what permissions the *FeedAppClientRole* is allowed. In our case, we **ONLY** want it to be able to query/read articles. Let's check/uncheck the appropriate boxes to enforce that.

**FeedAppClientRole Permissions**

| Table | Create | Read | Update | Delete | Fields |
| ----- | ------ | ---- | ------ | ------ | ------ |
| Articles | False | All Records | No Records | False | Full Access |

Now we need to attach this role to an API Token that can be added to our app. Navigate to [`Settings > API Tokens`](https://app.8base.com/settings/api-tokens) and add a new token by giving it a name and selecting under "Roles" the *FeedAppClientRole* that we just created. 

Make sure to copy the API token once created! You won't be able to view it again.

##### 5) Getting the Workspace API Endpoint
Finally, let’s copy our workspace’s API endpoint. This endpoint is unique to our workspace and is where we will send all of our GraphQL queries for new records. 

There are a few ways to obtain the endpoint. However, just navigate to the workspace **Home** page and you’ll find the endpoint in the bottom left.

##### 6) Testing that it works!
We should probably test that our API is properly set up before we keep going. How, you might ask? By querying it! Instead of setting up or using some GraphQL client, let's just run a good 'ol fashion curl command in our terminal and view the response.

Make sure to replace `<YOUR_API_ENDPOINT>` with your workspace API endpoint and `<YOUR_API_TOKEN>` with the API Token you created.

```shell
curl -X POST '<YOUR_API_ENDPOINT>' \
     -H "Content-Type: application/json" \
     -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
     -d '{ "query": "{ articlesList(first: 10) { items { title } } }"}'
```
Does the JSON response show a list of article titles? Woo hoo! Nice work. We're now ready to keep cruizing and move into the creating the component.

## Setting up the component
So, let's quickly list out what our infinite scroll component is going to have to do. That way we'll be able to think more clearly about the steps we need to take.

**Simple Spec**
* Query a GraphQL endpoint for *N* many records.
* Allow the user to scroll vertically through a rendered list.
* Recognize when the user has reached the end of the list.
* Query *N* additional records and append them to the list.
* Allow for the developer to specify a template for list items.

With these bullets in mind, let's add some code to our files so that we have a structure to work with.

### `examples/default.vue`
Again, the reason that we have the *examples/default.vue* file is so we can import the component being developed like we would in a full application. Go ahead and run `vue serve examples/default.vue` – or `vue serve default.vue`, if you're already in the examples directory. This will spin up the instant prototyping development server. You may see some errors while making incremental file updates; just ignore them for now.

Per our simple spec, we want an infinite scroll component that fetches a specified number of records from a GraphQL API. Additionally, we want to be able to specify a template that will get rendered for each record that's fetched.

With that in mind, let's create an example of **how we'd like to use our component**. Always read the in-code comments!

```html
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
      Here's our InfiniteScroll component. We want to pass it some simple props so that the component knows... 
        
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
            Instead of being stuck with a generic template, we want to be able to render out each record that gets fetched with a
            custom template. 
            
            1) Using v-slot we can name the scoped data that's passed to the template.
            2) The template is a child component of InfiniteScrollm so we can access it using <slot />
          -->
          <template v-slot="item">
              <!-- 
                Using the scoped slot data, we're creating a simple template that will render out the wanted data from our fetched records.
                -->
              <article>
                <h4>{{ item.title }}</h4>
                <p>{{ item.body }}</p>
              </article>
          </template>
      </InfiniteScroll>
    </section>
</template>

<!-- 
  Next up... <script> will go here 
-->
```

Sweet! We essentially just typed out how we'd like to *use* our `InfiniteScroll` component. It looks pretty intuitive, right? Now we have to **ACTUALLY BUILD IT**... Before that though, let's add the `<script>` tag to our `examples/default.vue` file so that all the named data values are present.

Just place the following code right below the `<template>` tag and the comments!

```html
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
            endpoint: 'YOUR WORKSPACE API ENDPOINT',
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
```

Nice work! Our `examples/default.vue` component is set up. Make sure that you updated the `endpoint` and `apiToken` values with those from your workspace.

### `infiniteScroll.vue`
Now it's time for the actual `InfiniteScroll` component. Similarly to the last component, let's start with the `<template>` and `<style>` tags. Infinite scrolling does require some functional styling.

```html
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

<!-- 
  Next up... <script> will go here 
-->
```

I know. It's almost frustratingly simple, right? However, why make something more complex than it has to be? All we want to do is template every record fetched from our API, as well as know when to fetch more of them. *That* is what *this* does. 

So, let's now add the `<script>` tag that will make everything actually work.

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
```

Naturally, this part is a little bit meatier than the others. That said, there are really only several things worth pointing out; the in-code documentation should handle the rest.

First off, we initialize the `GraphQLClient` and conditionally pass it `headers` depending on whether or not an `authToken` was passed. The initialized client is what gets used in the `loadBatch` method to execute GraphQL calls to our API. It uses the required `query` prop, which receives the `skip` and `limit` variables.

The `skip` and `limit` variables are what the `articlesList` query requires to handle pagination. While `limit` simply represents *how many records to load per request*, `skip` specifies *how many records have already been loaded* – or *from which index in the list to slice*. Thus, if we initially fetch records `A`, `B`, and `C` from our API with `limit = 3, skip = 0`, and then on the following request specify `limit = 3, skip = 3`, we'll receive records `D`, `E`, and `F`.

Lastly, let's look at the `handleScroll` method. This is that callback method for the `@scroll` event. By unpacking the passed `event` argument we get access to the `scrollTop`, `clientHeight`, and `scrollHeight` values. The `clientHeight` is a fixed value that represents the height of the scrollable element in pixels. Meanwhile, `scrollTop` is changing on every scroll event to represent the distance from the top of the scroll container to the current position. 

If the `clientHeight` plus `scrollTop` is greater than to or equal to the `scrollHeight` (the scrollable height of the element in pixels) then we know the container has been fully scrolled!

### `index.js`
Wondering why your component isn't appearing in the browser ([http://localhost:8080](http://localhost:8080))? We didn't export it!

Update the `index.js` file with the following:

```javascript
import InfiniteScroll from './infiniteScroll.vue';

export { InfiniteScroll }
```

## Wrap up and some other fun stuff
Our pagination component is done! It can now be used with any Vue project with any GraphQL API. The component should be rendering out the records in the browser. If not, check out the errors and let me know if something is acting funky!

Additionally, if you're interested in building a full pagination component (tabs with navigation) as opposed to an infinite scroll. Check out this [Pagination in Vue.js](https://medium.com/@denny.headrick/pagination-in-vue-js-4bfce47e573b) article by [Denny Hendrick](https://dennyheadrick.com/).

With that said, here is the [tutorial's GitHub repository with examples](https://github.com/8base/Tutorials/tree/master/infinite-scroll-pagination-component-using-graphql-and-vuejs/infinite-scroll-component)
