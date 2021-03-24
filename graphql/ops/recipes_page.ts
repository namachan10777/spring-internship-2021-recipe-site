import gql from 'graphql-tag';
export default gql`
  query RecipesPage($page: Int, $keyword: String) {
    recipes(page: $page, keyword: $keyword) {
      recipes {
        id
        title
        author {
          user_name
        }
        image_url
        description
      }
      has_next
      has_prev
    }
  }
`;
