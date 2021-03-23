import { Recipe } from '../../../lib/recipe';

export const resolvers = {
  Query: {
    recipes: async () => {
      try {
        const api_res = await fetch(`https://internship-recipe-api.ckpd.co/recipes`, {
          method: 'GET',
          headers: new Headers({
            'X-Api-Key': process.env.COOKPAD_API_KEY as string,
          }),
        });
        const json = await api_res.json();
        return json.recipes.map((recipe: Recipe) => (recipe));
      } catch (err) {
        throw err;
      }
    }
  }
};
