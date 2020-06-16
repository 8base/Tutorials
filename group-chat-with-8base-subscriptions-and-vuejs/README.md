# Simple Group Messaging App using 8base + Vue.js

### Create Vue App

Init Vue App using CLI.

```sh
vue create group-chat
```

Move into directory.

```sh
cd group-chat
```

Add dependencies.

```sh
yarn add subscriptions-transport-ws isomorphic-ws apollo-link-http apollo-cache-inmemory apollo-boost graphql graphql-tag
```

Add environment variables to an `.env.local` file in the root of the project.

```txt
VUE_APP_8BASE_API_ENDPOINT=<YOUR_8BASE_WORKSPACE_API_ENDPOINT>
VUE_APP_8BASE_WORKSPACE_ID=<YOUR_8BASE_WORKSPACE_ID>
VUE_APP_8BASE_WS_ENDPOINT=wss://ws.8base.com
```

Start the server!
```sh
yarn serve
```
