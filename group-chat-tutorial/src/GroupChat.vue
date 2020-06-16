<template>
  <div id="app">
    <div v-if="username" class="chat">
      <div class="chat-header">
        <h3>Hi {{ username }}!</h3>
      </div>

      <div class="msgs">
        <div v-for="(msg, i) in messages" :key="i" :class="['msg', { isAuthor: msg.author === username}]">
          {{ msg.body }}
          <br>
          <small>{{ msg.author }} - {{ msg.createdAt }}</small>
        </div>
      </div>

      <div class="msg-input">
        <textarea v-model="newMessage" rows="2"></textarea>
        <button @click="sendMessage">Send Message</button>
      </div>
    </div>

    <div v-else class="signup">
      <label for="username">Set a username</label>
      <input type="text" @blur="setUsername">
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Api from "./utils/api";
import Wss from "./utils/wss";

export default {
  name: "GroupChat",

  data: () => ({
    messages: [],
    username: 'john',
    newMessage: undefined,
  }),

  methods: {
    setUsername ({ target: { value } }) {
      this.username = value
    },

    addMessage({
      data: {
        Messages: { node },
      },
    }) {
      this.messages.push(node);
    },

    async getMessages() {
      const {
        data: {
          messagesList: { items },
        },
      } = await Api.query({
        query: gql`
          query {
            messagesList(last: 50) {
              items {
                body
                author
                createdAt
              }
            }
          }
        `,
      });

      this.messages = items;
    },

    async sendMessage() {
      await Api.mutate({
        mutation: gql`
          mutation($body: String!, $author: String!) {
            messageCreate(data: { body: $body, author: $author }) {
              body
              author
              createdAt
            }
          }
        `,
        variables: {
          body: this.newMessage,
          author: this.username
        }
      });

      this.newMessage = undefined
    },
  },

  watch: {
    username (v) {
      if (v) this.getMessages()
    }
  },

  created() {
    Wss.subscribe(
      gql`
        subscription {
          Messages(filter: { mutation_in: create }) {
            node {
              body
              author
              createdAt
            }
          }
        }
      `,
      {
        data: this.addMessage,
        error: (err) => console.log(err),
      }
    );
  },
};
</script>
