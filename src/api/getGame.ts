import gql from 'graphql-tag';

export default gql`
query($id: ID!) {
	getGame(id: $id) {
		id
		modified
	}
  }
`;