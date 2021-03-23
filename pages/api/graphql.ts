import { ApolloServer } from 'apollo-server-micro';
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
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

  type RecipePage {
    recipes: [Recipe!]!
    has_next: Boolean!
    has_prev: Boolean!
  }

  type Query {
    recipes(page: Int): RecipePage!
  }
`;

class CookpadAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://internship-recipe-api.ckpd.co/';
  }

  async willSendRequest(req: RequestOptions) {
    req.headers.set('X-Api-Key', process.env.COOKPAD_API_KEY as string);
  }

  async getRecipes(page: number) {
    const res = await this.get('recipes', { page });
    return {
      recipes: res.recipes,
      has_next: res.links.next != null,
      has_prev: res.links.next != null,
    };
  }
}

export const resolvers = {
  Query: {
    recipes: async (_: any, query: { page: number }, { dataSources }: { dataSources: { api: CookpadAPI } }) => {
      return dataSources.api.getRecipes(query.page);
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    api: new CookpadAPI(),
  }),
});

//const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
