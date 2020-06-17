import gql from "graphql-tag";

export const ListParticipants = gql`
  query {
    participantsList {
      items {
        id
        intId
        username
      }
    }
  }
`;

export const CreateParticipant = gql`
  mutation($username: String!) {
    participantCreate(data: { username: $username }) {
      id
    }
  }
`;

export const DeleteParticipant = gql`
  mutation($id: ID!) {
    participantDelete(data: { id: $id, force: true }) {
      success
    }
  }
`;

export const ParticipantsSubscription = gql`
  subscription {
    Participants(filter: { mutation_in: [create, delete] }) {
      mutation
      node {
        id
        intId
        username
      }
    }
  }
`;

export const CreateMessage = gql`
  mutation($id: ID!, $content: String!) {
    messageCreate(
      data: { content: $content, participant: { connect: { id: $id } } }
    ) {
      id
    }
  }
`;

export const MessagesSubscription = gql`
  subscription {
    Messages(filter: { mutation_in: create }) {
      node {
        content
        createdAt
        participant {
          id
          intId
        }
      }
    }
  }
`;
