export interface Marrakech {
	id: string;
	modified: string;
	players: [Player]
	totalPlayers: number,
	board: Board,
	lobby?: boolean
}

export interface Player {
	id?: string,
	name?: string,
	deck: [],
	dirhams: number,
}

export interface Board {
	assam_x: number,
	assam_y: number,
	assam_dir: any
	width: number,
	height: number,
	grid: [],
	dir_grid: [],
	top_carpets: [],
	primary_diagonal_loop: boolean,
}

export interface GQLRes {
    data?: any;
}