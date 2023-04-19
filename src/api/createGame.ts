import gql from 'graphql-tag';

export default gql`
mutation($board: BoardInput!) {
	createGame(board: $board) {
		id
		modified
	}
  }
`;