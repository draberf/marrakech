import gql from 'graphql-tag';

export default gql`
query($id: ID!) {
	getGame(id: $id) {
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
		totalPlayers
	}
}
`;