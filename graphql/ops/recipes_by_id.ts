import gql from 'graphql-tag';
export default gql`
  query RecipesByIds($ids: [ID!]!) {
    recipesByIds(ids: $ids) {
      id
      title
      author {
        user_name
      }
      image_url
      description
    }
  }
`;
