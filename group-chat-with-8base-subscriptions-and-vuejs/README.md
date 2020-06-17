# Public Chat Room Component using 8base + Vue.js

In this tutorial, we're going to build a public chat room! To accomplish that goal we'll need to learn how to use GraphQL subscriptions. By using subscriptions, we'll be able to listen for real-time updates via the 8base GraphQL API.

The Public Chat Room Component we're building can be used in any Vue.js app. Additionally, regardless of the framework you're working with, most of the code and concepts can be re-purposed to any Javascript app! So, let's get going.

### Technologies

- Front-end:

  - Vue.js
  - ApolloClient

- Backend:
  - 8base

### Project Setup

To move things along, you can [clone the starter project](https://link.com). The `master` branch is the bare-bones starter project, while the `public-chat-room` branch is the finished project. Feel free to reference one or the other if you get stuck along the way!

```sh
# Clone project
git clone <URL> group-chat
# Move into directory
cd group-chat
# Install dependencies
yarn
```

In order to communicate with the backend, there are 3 environment variables we must set. To ensure that our Vue app makes them available, create a `.env.local` file in the root directory with the following command.

```sh
echo 'VUE_APP_8BASE_WORKSPACE_ID=<YOUR_8BASE_WORKSPACE_ID>
VUE_APP_8BASE_API_ENDPOINT=https://api.8base.com
VUE_APP_8BASE_WS_ENDPOINT=wss://ws.8base.com' \
> .env.local
```

Both the `VUE_APP_8BASE_API_ENDPOINT` and `VUE_APP_8BASE_WS_ENDPOINT` values are always the same. The value that we'll need to update is the `VUE_APP_8BASE_WORKSPACE_ID`. If you already have an 8base workspace that you want to use for this tutorial, go ahead and update your `.env.local` file with the workspace ID. Otherwise, retrieve your workspace ID by completing steps 1 & 2 of the [8base Quickstart](https://docs.8base.com/docs/getting-started/quick-start).

### Importing the Schema

With the front-end application setup, we now need to provision the backend. At the root of this repo you should find a `chat-schema.json` file. To import it to the workspace, we'll simply need to install and authenticate the 8base command line and then import the schema file.

```sh
# Install 8base CLI
yarn global add 8base-cli
# Authenticate CLI
8base login
# Import the schema to our workspace
8base import -f chat-schema.json -w <YOUR_8BASE_WORKSPACE_ID>
```

Admittedly, we're importing one table that has one field and one relationship. It would have been equally easy to use [8base's Data Builder](https://docs.8base.com/docs/8base-console/platform-tools/data-builder) to accomplish the same!

### API Permissions

The last thing we must do to set up our backend (...seriously ) is to update our API permissions. Since we're not tackling authentication in this tutorial, we must enable public access to the GraphQL API.

In the 8base Console, navigate to `App Services > Roles > Guest`. Update the permissions set for both `Messages` and `Users` to be either **on** or **All Records** (as seen in the screen shot below). Essentially, the `Guest` role defines what a user making an un-authenticated request to the API is permitted to do.

![Setting public permissions in 8base console for public group chat vue app](./.assets/chat-permissions.png)

### Writing the GraphQL Queries

At this point, we're going to define and write out all of the GraphQL queries that we'll be needing for our chat component. This will help us understand what data we will be reading, creating, and listenin to (websockets) using the API.

The following code should be put in a file located at `src/utils/graphql.js`. Make sure to read the comments above each exported constant to understand what each query is accomplishing.

```js
// gql converts the query strings into graphQL documents
import gql from "graphql-tag";

// 1. Fetch all online chat Users and last 10 messages
export const InitialChatData = gql`
  {
    usersList {
      items {
        id
        email
      }
    }
    messagesList(last: 10) {
      items {
        content
        createdAt
        author {
          id
          email
        }
      }
    }
  }
`;

// 2. Create new chat users and assign them the Guest role
export const CreateUser = gql`
  mutation($email: String!) {
    userCreate(data: { email: $email, roles: { connect: { name: "Guest" } } }) {
      id
    }
  }
`;

// 3. Delete a chat user
export const DeleteUser = gql`
  mutation($id: ID!) {
    userDelete(data: { id: $id, force: true }) {
      success
    }
  }
`;

// 4. Listen for when chat users are created or deleted
export const UsersSubscription = gql`
  subscription {
    Users(filter: { mutation_in: [create, delete] }) {
      mutation
      node {
        id
        email
      }
    }
  }
`;

// 5. Create new chat messages and connect it to it's author
export const CreateMessage = gql`
  mutation($id: ID!, $content: String!) {
    messageCreate(
      data: { content: $content, author: { connect: { id: $id } } }
    ) {
      id
    }
  }
`;

// 6. Listen for when chat messages are created.
export const MessagesSubscription = gql`
  subscription {
    Messages(filter: { mutation_in: create }) {
      node {
        content
        createdAt
        author {
          id
          email
        }
      }
    }
  }
`;
```

### Creating the Apollo and Subscription Client

With our GraphQL queries written it's time to set up our client modules. Otherwise, we can't run the queries!

First, let's tackle the API client. For this we'll be using `ApolloClient` with its required defaults. To the `createHttpLink` we'll be supplying our fully formed workspace endpoint. This code should be place at `src/utils/api.js`

_Note: To learn more about the options available when configuring ApolloClient, [please reference their documentation](https://www.apollographql.com/docs/react/get-started/)._

```js
import { ApolloClient } from "apollo-boost";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

const { VUE_APP_8BASE_API_ENDPOINT, VUE_APP_8BASE_WORKSPACE_ID } = process.env;

export default new ApolloClient({
  link: createHttpLink({
    uri: `${VUE_APP_8BASE_API_ENDPOINT}/${VUE_APP_8BASE_WORKSPACE_ID}`,
  }),
  cache: new InMemoryCache(),
});
```

Secondly, let's tackle the Subscription client. For this we'll be using `subscriptions-transport-ws` and 'isomorphic-ws'. The script is a little more developed than our last one, so please take the time to read through the in code comments!

That said, we're initalizing the `SubscriptionClient` using our 8base websocket endpoint and `workspaceId` set in the `connectionParams`. We then use that `subscriptionClient` in two methods defined on the default exporte; `subscribe()` and `close()`.

The `subscribe` method is what will allow is to create new subscriptions while handling `data` and `error` callbacks. The `close` method is what we will later user to close the connection when leaving the chat room.

_Note: To learn more about the `SubscriptionClient` and its options, [please reference their documentation](https://www.npmjs.com/package/subscriptions-transport-ws#api-docs)_

```js
import WebSocket from "isomorphic-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";

const { VUE_APP_8BASE_WS_ENDPOINT, VUE_APP_8BASE_WORKSPACE_ID } = process.env;

/**
 * Create the subscription client using the relevant environment
 * variables and default options
 */
const subscriptionClient = new SubscriptionClient(
  VUE_APP_8BASE_WS_ENDPOINT,
  {
    reconnect: true,
    connectionParams: {
      /**
       * WorkspaceID MUST be set or the Websocket Endpoint wont be able to
       * map the request to the appropriate workspace
       */
      workspaceId: VUE_APP_8BASE_WORKSPACE_ID,
    },
  },
  /**
   * Constructor for W3C compliant WebSocket implementation. Use this when
   * your environment does not have a built-in native WebSocket
   * (for example, with NodeJS client)
   */
  WebSocket
);

export default {
  /**
   * Accepts the subscription query, any variables and the
   * callback handlers 'data' and 'error'
   */
  subscribe: (query, options) => {
    const { variables, data, error } = options;
    /**
     * Runs the new subscription request.
     */
    const result = subscriptionClient.request({
      query,
      variables,
    });
    /**
     * The unsubscribe function can be used to close a specific
     * subscription as opposed to ALL subscriptions be maintained
     * by the subscriptionClient
     */
    const { unsubscribe } = result.subscribe({
      /**
       * Whenever an event is recieved, the result is passed
       * to the developer specified data callback.
       */
      next(result) {
        if (typeof data === "function") {
          data(result);
        }
      },
      /**
       * Whenever an error is recieved, the error is passed
       * to the developer specified error callback.
       */
      error(e) {
        if (typeof error === "function") {
          error(e);
        }
      },
    });

    return unsubscribe;
  },
  /**
   * Closes subscriptionClient's connection.
   */
  close: () => {
    subscriptionClient.close();
  },
};
```

### Writing the Vue Component

At this point, we have **everything we need to build our public chat room**! All that's left is writing out our single `GroupChat.vue` component. Boot up the component with `yarn serve` and let's get to it. 

_Note: Beauty is in the eye of the beholder... and because of that only the minimum styling needed to make the component functional have been added._

##### Component <script>

First thing we'll need in our script tag is to import our modules, simple styling, and GraphQL queries. All of those artifacts exist in our `src/utils` directory. Insert the following imports after the opening `<script>` tag in `GroupChat.vue`.

```js
import Api from "./utils/api";
import Wss from "./utils/wss";

/* graphQL operations */
import {
  InitialChatData,
  CreateUser,
  DeleteUser,
  UsersSubscription,
  CreateMessage,
  MessagesSubscription,
} from "./utils/graphql";

/* Styles */
import "../assets/styles.css";
```

##### Component data

We can define what data properties we want in our component's `data` function. If we think about it, all we need is a way to store chat users, messages, who the "current" user is, and any message that's not yet sent. These properties can be added like so:

```js
// imports ...

export default {
  name: "GroupChat",

  data: () => ({
    messages: [],
    newMessage: "",
    me: { email: "" },
    users: [],
  }),
};
```

##### Lifecycle hooks

Our lifecycle hooks execute at different moments in the Vue component's "life". For example, when it's `mounted` or `updated`. In our case, we'll only really care about when it's `created` and `beforeDestroy`. At those times, we'll want to either create chat subscriptions or close chat scriptions. The methods will work using the following code.

```js
// imports ...

export default {
  // other properties ...

  /**
   * Lifecycle hook executed when the component is created.
   */
  created() {
    /**
     * Create Subscription that triggers event when user is created or deleted
     */
    Wss.subscribe(UsersSubscription, {
      data: this.handleUser,
    });
    /**
     * Create Subscription that triggers event when message is created
     */
    Wss.subscribe(MessagesSubscription, {
      data: this.addMessage,
    });
    /**
     * Fetch initial chat data (Users and last 10 Messages)
     */
    Api.query({
      query: InitialChatData,
    }).then(({ data }) => {
      this.users = data.usersList.items;
      this.messages = data.messagesList.items;
    });
    /**
     * Callback executed on page refresh to close chat
     */
    window.onbeforeunload = this.closeChat;
  },
  /**
   * Lifecycle hook executed before the component is destroyed.
   */
  beforeDestroy() {
    this.closeChat();
  },
};
```

##### Component methods

Not only have we created several methods above that don't exist yet... we need to create the specific methods intended to handle each API call/response (`createMessage`, `addMessage`, `closeChat`, etc.). These will all get stored on the methods object of our component.

One thing worth noting is that on most of our mutations we are not waiting for or handling responses. The reason for this is that we have subscriptions running that are listening for those mutations to be run. Once run successfully, it's the subscription that is handling the response data.

Most of these methods are pretty self explanatory! Regardless, please read the comments in the following code.

```js
// imports ...

export default {
  // other properties ...

  methods: {
    /**
     * Create the new user using a submitted email address.
     */
    createUser() {
      Api.mutate({
        mutation: CreateUser,
        variables: {
          email: this.me.email,
        },
      });
    },
    /**
     * Delete a user by their ID.
     */
    deleteUser() {
      Api.mutate({
        mutation: DeleteUser,
        variables: { id: this.me.id },
      });
    },
    /**
     * Our users subscription listing to both the create and update events, and
     * therefore we need to choose the apprpriate method to handle the response
     * based on the mutation type.
     *
     * Here, we have an object that looks up the mutation type by name, returns
     * it and executes the function while passing the event node.
     */
    handleUser({
      data: {
        Users: { mutation, node },
      },
    }) {
      ({
        create: this.addUser,
        delete: this.removeUser,
      }[mutation](node));
    },
    /**
     * Adds a new user to users array, first checking whether the user
     * being added is the current user.
     */
    addUser(user) {
      if (this.me.email === user.email) {
        this.me = user;
      }

      this.users.push(user);
    },
    /**
     * Removes user from the users array by ID.
     */
    removeUser(user) {
      this.users = this.users.filter(
        (p) => p.id != user.id
      );
    },
    /* Create a new message */
    createMessage() {
      Api.mutate({
        mutation: CreateMessage,
        variables: {
          id: this.me.id,
          content: this.newMessage,
        },
      }).then(() => (this.newMessage = ""));
    },
    /**
     * Our messages subscription only listens to the create event. Therefore, all we
     * need to do is push it into our messages array.
     */
    addMessage({
      data: {
        Messages: { node },
      },
    }) {
      this.messages.push(node);
    },
    /**
     * We'll want to close our subscriptions and delete the user. This method can be
     * called in our beforeDestroy lifecycle hook and any other relevantly placed callback.
     */
    closeChat () {
      /* Close subscriptions before exit */
      Wss.close()
      /* Delete participant */
      this.deleteUser();
      /* Set me to default */
      this.me = { me: { email: '' } },
    }
  }

  // lifecycle hooks ...
}
```

### Component <template>

Last but not least, we have our component `<template>`. There are 1000's of great tutorials out there on how to build beautiful UIs. **This is not one of those tutorials**.

The following template meets the minimum spec of a group chat app. It's really up to you to go in and make this thing beauriful. That said, let's quickly walk through the key markup that we've implimented here. As always, please read the in-line code comments.

```html
<template>
  <div id="app">
    <!-- 
      Only if the current user has an ID (has been created) should the
      chat view be rendered. Otherwise, a sign up for is shown.
     -->
    <div v-if="me.id" class="chat">
      <div class="header">
        <!-- 
          Since we're using subscriptions that run in real-time, our
          numbe of user currently online will dynamically adjust.
         -->
        {{ participants.length }} Online Users
        <!-- 
          A user can leave the chat by executing the 
          closeChat function.
         -->
        <button @click="closeChat">Leave Chat</button>
      </div>
      <!-- 
        For every message that we're storing in the messages array,
        we'll render out in a div. Additionally, if the messages participant
        id matches the current user id, we'll assign it the me class.
       -->
      <div
        :key="index"
        v-for="(msg, index) in messages"
        :class="['msg', { me: msg.participant.id === me.id }]"
      >
        <p>{{ msg.content }}</p>
        <small
          ><strong>{{ msg.participant.email }}</strong> {{ msg.createdAt
          }}</small
        >
      </div>
      <!-- 
        Our message input is bound to the newMessage data property.
       -->
      <div class="input">
        <input
          type="text"
          placeholder="Say something..."
          v-model="newMessage"
        />
        <!-- 
          When the user clicks the send button, we run the createMessage function.
         -->
        <button @click="createMessage">Send</button>
      </div>
    </div>
    <!-- 
      The sign up flow simply asks the user to enter an email address. Once the
      input is blurred, the createUser method is executed.
     -->
    <div v-else class="signup">
      <label for="email">Sign up to chat!</label>
      <br />
      <input
        type="text"
        v-model="me.email"
        placeholder="What's your email?"
        @blur="createUser"
        required
      />
    </div>
  </div>
</template>
```

## Wrap up and Testing

Believe it or not, the whole Public Chat Room is now built. If you open it on you localhost network, you'll be able to start submitting messages. However, to prove that it's a real group chat, open several windows and watch the conversation flow!

In this tutorial, you learned how to initialize `ApolloClient` and `SubscriptionClient` to effectively execute GraphQL queries, mutations, and subscriptions to an 8base workspace. Also, maybe you learned a little bit about Vue.js :)

Whether you're working on a web/mobile game, messaging and notification apps, or other projects that have real-time data requirement, subscriptions are an amazing tool to leverage. We barely scratched the surface in this tutorial!

Based on the success of this tutorial, we will develop it further to include user authentication, private channels and messages, file uploads, and advanced chat app features. **So please let us know if you found this valueable and want more!** Otherwise, the following resources are great for follow-on learning.

* [Vue Lifecylce Diagram](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
* [Apollo Client Docs](https://www.apollographql.com/docs/react/api/apollo-client/)
* [8base GraphQL API](https://docs.8base.com/docs/8base-console/graphql-api)
* [8base Subscriptions](https://docs.8base.com/docs/8base-console/graphql-api/subscriptions)