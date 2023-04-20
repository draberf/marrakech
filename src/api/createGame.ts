import gql from 'graphql-tag';

export default gql`
mutation($board: BoardInput!, $players: [PlayerInput!]!, $lobby: Boolean!, $playercount: Int!) {
	createGame(board: $board, lobby: $lobby, players: $players, playercount: $playercount) {
		id
		modified
	}
  }
`;