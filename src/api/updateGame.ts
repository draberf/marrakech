import gql from 'graphql-tag';

export default gql`
mutation($id: ID!, $modified: AWSDateTime!, $players: [PlayerInput!]!, $board: BoardInput!, $turnInfo: TurnInfoInput) {
	updateGame(id: $id, modified: $modified, players: $players, board: $board, turnInfo: $turnInfo) {
		id
		modified
        players {
            id
            name
			deck
			dirhams
        }
		board {
			assam_dir
			assam_x
			top_carpets {
				color
				isVertical
				x
				y
			}
			width
			primary_diagonal_loop
			height
			grid
			dir_grid
			assam_y
		}
		turnInfo {
			turn
			last_rolled
			next_action
			next_player
		}
	}
}
`;