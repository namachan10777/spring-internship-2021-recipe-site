import { ApolloServer } from 'apollo-server-micro';
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
import { gql } from 'apollo-server-micro';
import { readFileSync } from 'fs';
const schema = readFileSync('graphql/schema.graphql', 'utf8');

export const typeDefs = gql(schema);

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
