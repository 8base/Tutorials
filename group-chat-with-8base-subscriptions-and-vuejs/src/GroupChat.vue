<style scoped>
#app {
  height: 100%;
}

.chat {
  width: 50%;
  margin: 0 auto;
}

.signup {
  width: 25%;
  height: 500px;
  display: flex;
  margin: 0 auto;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}
</style>

<template>
  <div id="app">
    <div v-if="myself" class="chat">
      <Chat
        :colors="colors"
        :myself="myself"
        :messages="messages"
        :send-images="false"
        :submit-icon-size="30"
        :display-header="true"
        :hide-close-button="true"
        :border-style="borderStyle"
        :participants="participants"
        :submit-image-icon-size="30"
        :scroll-bottom="scrollBottom"
        :chat-title="'8base Vue-Chat'"
        :timestamp-config="timestampConfig"
        @onMessageSubmit="createMessage"
      />
    </div>

    <div v-else class="signup">
      <label for="email">Sign up to chat!</label>
      <br />
      <input
        v-model="username"
        type="text"
        placeholder="first name"
        @blur="createParticipant"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-debugger */
import Api from "./utils/api";
import Wss from "./utils/wss";

/* Quick Chat and Dependencies */
import { Chat } from "vue-quick-chat";
import chatConfig from "./utils/chat";
import "vue-quick-chat/dist/vue-quick-chat.css";

/* GraphQL operations */
import {
  ListParticipants,
  CreateParticipant,
  DeleteParticipant,
  ParticipantsSubscription,
  CreateMessage,
  MessagesSubscription,
} from "./utils/graphql";

export default {
  name: "GroupChat",

  components: {
    Chat,
  },

  data: () => ({
    username: undefined,
    ...chatConfig,
  }),

  methods: {
    async createParticipant() {
      await Api.mutate({
        mutation: CreateParticipant,
        variables: {
          username: this.username,
        },
      });
    },

    deleteParticipant() {
      Api.mutate({
        mutation: DeleteParticipant,
        variables: { id: this.myself.uid },
      });
    },

    addParticipants({
      data: {
        participantsList: { items },
      },
    }) {
      this.participants = items.map((p) => ({
        uid: p.id,
        id: p.intId,
        name: p.username,
      }));
    },

    handleParticipant({
      data: {
        Participants: { mutation, node },
      },
    }) {
      if (mutation === 'delete') {

      }

      const participant = {
        uid: node.id,
        id: node.intId,
        name: node.username,
      };

      node.username === this.username
        ? (this.myself = participant)
        : this.participants.push(participant);
    },

    addMessage({
      data: {
        Messages: { node },
      },
    }) {
      const createdAt = new Date(node.createdAt);

      this.messages.push({
        content: node.content,
        participantId: node.participant.intId,
        myself: node.participant.intId === this.myself.id,
        timestamp: {
          year: createdAt.getYear(),
          month: createdAt.getMonth(),
          day: createdAt.getDay(),
          hour: createdAt.getHours(),
          minute: createdAt.getMinutes(),
          second: createdAt.getSeconds(),
          millisecond: createdAt.getMilliseconds(),
        },
        type: "text",
      });
    },

    createMessage({ content }) {
      Api.mutate({
        mutation: CreateMessage,
        variables: {
          data: {
            id: this.myself.uid,
            content,
          },
        },
      });
    },
  },

  created() {
    /* Subescribe to new and deleted participants */
    Wss.subscribe(ParticipantsSubscription, {
      data: this.handleParticipant,
    });

    /* Subscribe to new messages */
    Wss.subscribe(MessagesSubscription, {
      data: this.addMessage,
    });

    /* Get current participants */
    Api.query({
      query: ListParticipants,
    }).then(this.addParticipants);

    /* Delete user on refresh */
    window.onbeforeunload = this.deleteParticipant;
  },

  beforeDestroy() {
    this.deleteParticipant();
  },
};
</script>
