function shuffle(arr: Array<any>) {
	let m = arr.length;
	while (m) {
		const i = Math.floor(Math.random()*m--);
		[arr[m], arr[i]] = [arr[i], arr[m]];
	}
	return arr;
}

export const startingConfig = {
	"players-2": {

		players: [
			{
				deck: shuffle([...Array(12)].map(() => "RED").concat([...Array(12)].map(() => "YELLOW"))),
				dirhams: 30
			},
			{
				deck: shuffle([...Array(12)].map(() => "ORANGE").concat([...Array(12)].map(() => "BLUE"))),
				dirhams: 30
			}
		],
		playercount: 2,

		turn: 0,

		next_player: 0,
		next_action: "TURN",

		last_rolled: -1,

		board: {
			assam_dir: "SOUTH",
			assam_x: 3,
			assam_y: 3,
			dir_grid: [...Array(7)].map(_=>Array(7).fill("SOUTH")),
			grid: [...Array(7)].map(_=>Array(7).fill("EMPTY")),
			height: 7,
			primary_diagonal_loop: true,
			top_carpets: [],
			width: 7				
		},

	},
	"players-3": {

		players: [
			{
				deck: [...Array(15)].map(() => "RED"),
				dirhams: 30
			},
			{
				deck: [...Array(15)].map(() => "YELLOW"),
				dirhams: 30
			},
			{
				deck: [...Array(15)].map(() => "BLUE"),
				dirhams: 30
			}
		],
		playercount: 3,

		turn: 0,

		next_player: 0,
		next_action: "TURN",

		last_rolled: -1,

		board: {
			assam_dir: "SOUTH",
			assam_x: 3,
			assam_y: 3,
			dir_grid: [...Array(7)].map(_=>Array(7).fill("SOUTH")),
			grid: [...Array(7)].map(_=>Array(7).fill("EMPTY")),
			height: 7,
			primary_diagonal_loop: true,
			top_carpets: [],
			width: 7				
		}
	},
	"players-4": {

		players: [
			{
				deck: [...Array(12)].map(() => "RED"),
				dirhams: 30
			},
			{
				deck: [...Array(12)].map(() => "YELLOW"),
				dirhams: 30
			},
			{
				deck: [...Array(12)].map(() => "BLUE"),
				dirhams: 30
			},
			{
				deck: [...Array(12)].map(() => "ORANGE"),
				dirhams: 30
			}
		],
		playercount: 4,

		turn: 0,

		next_player: 0,
		next_action: "TURN",

		last_rolled: -1,
		
		board: {
			assam_dir: "SOUTH",
			assam_x: 3,
			assam_y: 3,
			dir_grid: [...Array(7)].map(_=>Array(7).fill("SOUTH")),
			grid: [...Array(7)].map(_=>Array(7).fill("EMPTY")),
			height: 7,
			primary_diagonal_loop: true,
			top_carpets: [],
			width: 7				
		}
	}
};
