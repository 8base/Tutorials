<template>
  <div id="app">
    <div v-if="me.id" class="chat">
      <div class="header">
        {{ participants.length }} Online Users
        <br />
        <small>{{ onlineUsersString }}</small>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['msg', { me: msg.participant.id === me.id }]"
      >
        <p>{{ msg.content }}</p>
        <small
          ><strong>{{ msg.participant.email }}</strong>
          {{ msg.createdAt }}</small
        >
      </div>

      <div class="input">
        <input
          type="text"
          placeholder="Say something..."
          v-model="newMessage"
        />
        <button @click="createMessage">Send</button>
      </div>
    </div>

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

<script>
/* eslint-disable no-debugger */
import Api from "./utils/api";
import Wss from "./utils/wss";

/* GraphQL operations */
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

export default {
  name: "GroupChat",

  data: () => ({
    messages: [],
    newMessage: "",
    me: { name: "" },
    users: [],
  }),

  computed: {
    onlineUsersString() {
      return this.users.map((p) => p.email).join(", ");
    },
  },

  methods: {
    /* Get initial chat data */
    initChat({
      data: {
        usersList: { items: users },
        messagesList: { items: messages },
      },
    }) {
      this.users = users;
      this.messages = messages;
    },

    /* Create the new user */
    createUser() {
      Api.mutate({
        mutation: CreateUser,
        variables: {
          email: this.me.email,
        },
      });
    },

    /* Delete the user */
    deleteUser() {
      Api.mutate({
        mutation: DeleteUser,
        variables: { id: this.me.id },
      });
    },

    /* Add a new user */
    addUser(user) {
      if (this.me.email === user.email) {
        this.me = user;
      }

      this.users.push(user);
    },

    /* Remove user */
    removeUser(user) {
      this.users = this.users.filter((p) => p.id != user.id);
    },

    /* Handle subscription for users */
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

    /* Handle subscription for messages */
    addMessage({
      data: {
        Messages: { node },
      },
    }) {
      this.messages.push(node);
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

    /* Before component is destroyed */
    closeChat() {
      /* Close subscriptions before exit */
      Wss.close();
      /* Delete participant */
      this.deleteUser();
    },
  },

  created() {
    /* Subescribe to new and deleted users */
    Wss.subscribe(UsersSubscription, {
      data: this.handleUser,
    });
    /* Subscribe to new messages */
    Wss.subscribe(MessagesSubscription, {
      data: this.addMessage,
    });
    /* Get initial chat data */
    Api.query({
      query: InitialChatData,
    }).then(({ data }) => {
      this.users = data.usersList.items;
      this.messages = data.messagesList.items;
    });

    /* Delete user on refresh */
    window.onbeforeunload = this.closeChat;
  },

  beforeDestroy() {
    this.closeChat();
  },
};
</script>
