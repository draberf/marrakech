import gql from 'graphql-tag';

export default gql`
mutation($id: ID!, $modified: AWSDateTime!, $players: [PlayerInput!]!) {
	updateGame(id: $id, modified: $modified, players: $players) {
		id
		modified
        players {
            id
            name
			deck
			dirhams
        }
	}
  }
`;