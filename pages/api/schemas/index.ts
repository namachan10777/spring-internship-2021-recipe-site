import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Recipe {
    id: ID
    title: String
  }

  type Query {
    recipes: [Recipe]
  }
`;
