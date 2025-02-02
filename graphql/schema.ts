import gql from 'graphql-tag';

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
    related_recipes: [ID!]!
  }

  type RecipesPage {
    recipes: [Recipe!]!
    has_next: Boolean!
    has_prev: Boolean!
  }

  type Query {
    recipes(page: Int, keyword: String): RecipesPage!
    recipe(id: ID!): Recipe
    recipesByIds(ids: [ID!]!): [Recipe!]
  }
`;
