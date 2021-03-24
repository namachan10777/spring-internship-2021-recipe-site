import gql from 'graphql-tag';
export default gql`
  query FullRecipesByIds($ids: [ID!]!) {
    recipesByIds(ids: $ids) {
      id
      title
      author {
        user_name
      }
      image_url
      description
      ingredients {
        name
        quantity
      }
      published_at
      steps
      related_recipes
    }
  }
`;
