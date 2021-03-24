import gql from 'graphql-tag';

export default gql`
query Recipe ($id: ID!) {
  recipe(id: $id) {
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
    steps
  }
}`;
