import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Author {
    user_name: String!
  }

  type Ingredient {
    name: String!
    quantity: String!
  }

  type Recipe {
    id: ID!
    title: String!
    description: String!
    image_url: String
    author: Author!
    published_at: String!
    steps: [String!]!
    ingredients: [Ingredient!]!
    related_recipes: [Int!]!
  }

  type Query {
    recipes(page: Int): [Recipe!]!
  }
`;
