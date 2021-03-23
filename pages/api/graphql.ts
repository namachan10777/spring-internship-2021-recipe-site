import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from './schemas/index';
import { resolvers } from './resolver/index';

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
