<style>
html, body, #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: grey;
  text-align: center;
  color: #2c3e50;
  flex: 1;
  height: 100%;
  display: flex;
}

.signup {
  justify-self: center;
  align-self: center;
  width: 100%;
}

.chat {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 500px;
  margin: 20px auto;
  border-radius: 25px;
  border: 1px solid gray;
}

.chat .msgs {
  display: flex;
  height: 380px;
  padding: 0 10px;
  overflow: hidden;
  overflow: hidden;
  overflow-y: scroll;
  flex-direction: column;
}

.chat .msgs .msg {
  width: 40%;
  margin: 5px;
  padding: 10px;
  border-radius: 10px;
  background: #42b983;
}

.chat .msgs .msg.isAuthor {
  align-self: flex-end;
  background: #DDD;
}

.chat .msg-input {
  display: flex;
  padding: 10px 20px;
  border-top: 1px solid gray;
  justify-content: space-evenly;
}
</style>

<template>
  <div id="app">
    <div v-if="username" class="chat">
      <div class="msgs">
        <div 
          :key="i"
          v-for="(msg, i) in messages"
          :class="['msg', { isAuthor: msg.author === username }]"
        >
          {{ msg.body }}
          <br>
          <small>{{ msg.author }} - {{ msg.createdAt}}</small>
        </div>
      </div>


      <div class="msg-input">
        <textarea v-model="newMessage" cols="30" rows="2"></textarea>
        <button @click="sendMessage">Send Message</button>
      </div>
    </div>

    <div v-else class="signup">
      <label for="username">Set a username</label>
      <br>
      <input name="username" type="text" @blur="setUsername" />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Api from "./utils/api";
import Wss from "./utils/wss";

export default {
  data: () => ({
    messages: [],
    username: undefined,
    newMessage: undefined,
  }),

  methods: {
    setUsername({ target: { value } }) {
      this.username = value;
    },

    addMessage ({ data: { Messages: { node } } }) {
      this.messages.push(node)
    },

    async getMessages() {
      const {
        data: {
          messagesList: { items },
        },
      } = await Api.query({
        query: gql`
          {
            messagesList(last: 50) {
              items {
                author
                body
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
          mutation($data: MessageCreateInput!) {
            messageCreate(data: $data) {
              body
              author
              createdAt
            }
          }
        `,
        variables: {
          data: {
            author: this.username,
            body: this.newMessage,
          },
        },
      });

      this.newMessage = undefined;
    },
  },

  watch: {
    username(name) {
      if (name) this.getMessages();
    }
  },

  created() {
    Wss.subscribe(gql`
      subscription {
        Messages(filter: { mutation_in: create }) {
          node {
            body
            author
            createdAt
          }
        }
      }
    `, {
      data: this.addMessage,
      err: (err) => console.log(err)
    });
  },
};
</script>