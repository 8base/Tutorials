export default {
  // {
  //   name: "Matheus S.",
  //   id: 3,
  // }
  participants: [],
  myself: undefined,
  // {
  //   content: "received messages",
  //   myself: false,
  //   participantId: 1,
  //   timestamp: {
  //     year: 2019,
  //     month: 3,
  //     day: 5,
  //     hour: 20,
  //     minute: 10,
  //     second: 3,
  //     millisecond: 123,
  //   },
  //   type: "text",
  // }
  messages: [],
  colors: {
    header: {
      bg: "#d30303",
      text: "#fff",
    },
    message: {
      myself: {
        bg: "#fff",
        text: "#bdb8b8",
      },
      others: {
        bg: "#fb4141",
        text: "#fff",
      },
      messagesDisplay: {
        bg: "#f7f3f3",
      },
    },
    submitIcon: "#b91010",
    submitImageIcon: "#b91010",
  },
  borderStyle: {
    topLeft: "10px",
    topRight: "10px",
    bottomLeft: "10px",
    bottomRight: "10px",
  },
  scrollBottom: {
    messageSent: true,
    messageReceived: false,
  },
  displayHeader: true,
  profilePictureConfig: {
    others: false,
    myself: false,
  },
  timestampConfig: {
    format: "HH:mm",
    relative: false,
  },
};
