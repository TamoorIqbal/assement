const { gql } = require('apollo-server-express');

// schema.js
// Define GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    # Add other fields as needed
  }

  type Query {
    users(page: Int, limit: Int, sortBy: String): [User]!
    user(id: ID!): User
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createUser(name: String!, email: String!, password: String!): User!
    updateUser(id: ID!, name: String, email: String, password: String): User
    deleteUser(id: ID!): User
  }

  type AuthPayload {
    token: String!
    user: User!
    message:String!
  }
`;

module.exports = typeDefs;
