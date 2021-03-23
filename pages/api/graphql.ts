import { ApolloServer } from 'apollo-server-micro';
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
import { gql } from 'apollo-server-micro';
import * as Api from '../../lib/recipe';
import { RecipesPage, QueryResolvers, Recipe } from '../../lib/generated/graphql';

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

class CookpadAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://internship-recipe-api.ckpd.co/';
  }

  async willSendRequest(req: RequestOptions) {
    req.headers.set('X-Api-Key', process.env.COOKPAD_API_KEY as string);
  }

  async getRecipes(page: number, keyword: string | null): Promise<RecipesPage> {
    const res = keyword ? await this.get('search', { page, keyword }) : await this.get('recipes', { page });
    return {
      recipes: res.recipes.map((recipe: Recipe) => ({
        ...recipe,
        image_url: recipe.image_url ? recipe.image_url.replace('http://', 'https://') : null,
      })),
      has_next: res.links.next != null,
      has_prev: res.links.prev != null,
    };
  }

  async getRecipesByIds(ids: string[]): Promise<Recipe[]> {
    const res = await this.get('recipes', { id: ids.join(',') });
    return res.recipes.map((recipe: Recipe) => ({
      ...recipe,
      image_url: recipe.image_url ? recipe.image_url.replace('http://', 'https://') : null,
    }));
  }

  async getRecipe(id: String): Promise<Recipe> {
    const res: Api.Recipe = await this.get(`recipes/${id}`);
    const image_url = res.image_url ? res.image_url.replace('http://', 'https://') : null;
    console.log(image_url);
    return {
      id: res.id.toString(),
      title: res.title,
      description: res.description,
      author: res.author,
      image_url: image_url,
      published_at: res.published_at,
      steps: res.steps,
      ingredients: res.ingredients,
      related_recipes: res.related_recipes,
    };
  }
}

const Query: QueryResolvers = {
  recipes: async (_: any, query, { dataSources }: { dataSources: { api: CookpadAPI } }): Promise<RecipesPage> => {
    return dataSources.api.getRecipes(query.page ? query.page : 1, query.keyword ? query.keyword : null);
  },
  recipe: async (_: any, query, { dataSources }: { dataSources: { api: CookpadAPI } }): Promise<Recipe> => {
    return dataSources.api.getRecipe(query.id);
  },
  recipesByIds: async (_: any, query, { dataSources }: { dataSources: { api: CookpadAPI } }): Promise<Recipe[]> => {
    return dataSources.api.getRecipesByIds(query.ids);
  },
};

export const resolvers = {
  Query,
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
