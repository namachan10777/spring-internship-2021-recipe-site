import { Recipe } from '../../../lib/recipe';

export const resolvers = {
  Query: {
    recipes: async (_: any, query: { page: number }) => {
      try {
        const api_res = await fetch(`https://internship-recipe-api.ckpd.co/recipes?page=${query.page}`, {
          method: 'GET',
          headers: new Headers({
            'X-Api-Key': process.env.COOKPAD_API_KEY as string,
          }),
        });
        const json = await api_res.json();
        console.log(json);
        return {
          recipes: json.recipes.map((recipe: Recipe) => ({
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            image_url: recipe.image_url,
            author: recipe.author,
            pubslished_at: recipe.published_at,
            steps: recipe.steps,
            ingredients: recipe.ingredients,
            related_recipes: recipe.related_recipes,
          })),
          has_next: json.links.next != null,
          has_prev: json.links.prev != null,
        };
      } catch (err) {
        throw err;
      }
    }
  }
};
