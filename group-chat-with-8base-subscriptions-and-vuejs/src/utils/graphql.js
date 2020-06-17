import gql from "graphql-tag";

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

export const CreateUser = gql`
  mutation($email: String!) {
    userCreate(data: { email: $email, roles: { connect: { name: "Guest" } } }) {
      id
    }
  }
`;

export const DeleteUser = gql`
  mutation($id: ID!) {
    userDelete(data: { id: $id, force: true }) {
      success
    }
  }
`;

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

export const CreateMessage = gql`
  mutation($id: ID!, $content: String!) {
    messageCreate(data: { content: $content, user: { connect: { id: $id } } }) {
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
        author {
          id
          email
        }
      }
    }
  }
`;
