import React, { EventHandler, useEffect, useState } from 'react';
import { BindingElement } from 'typescript';

// game state
import { Color, Direction, Player, Game, Carpet, Action, Board as gameBoard } from '../game';

// images
import blue_half from '../assets/carpets/blue.png'
import blue_full from '../assets/carpets/blue_complete.png'
import orange_half from '../assets/carpets/orange.png'
import orange_full from '../assets/carpets/orange_complete.png'
import red_half from '../assets/carpets/red.png'
import red_full from '../assets/carpets/red_complete.png'
import yellow_half from '../assets/carpets/yellow.png'
import yellow_full from '../assets/carpets/yellow_complete.png'
import empty from '../assets/carpets/empty.png'

import arc from '../assets/arc.png'
import assam from '../assets/assam.png'
import dirham from '../assets/dirham.png'
import { FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { API, graphqlOperation } from 'aws-amplify';
import updateGame from '../api/updateGame';
import { useParams } from 'react-router-dom';
import { GQLRes } from '../api/types';
import getGame from '../api/getGame';

const colors_half = [
  blue_half, orange_half, red_half, yellow_half
];
const colors_full = [
  blue_full, orange_full, red_full, yellow_full
];

enum TurnDirection {STRAIGHT, LEFT, RIGHT};

class Placement {

	firstTile: boolean = false;
	ready: boolean = false;
	tile1_x: number = -1;
	tile1_y: number = -1;

	carpet: Carpet | null = null;

}

// used to change the direction of tiles
function GetDirectionalTransform(direction: Direction): string {
  return 'rotate('+Array(180,90,0,270)[direction]+'deg)';
}

type GameObjectProp = {
	game: Game;
}
  
type TileProp = {
	game: Game;
	coordX: number;
	coordY: number;
	highlight_style: string;
	onClickCallback: Function;
}

type FunctionalProp = {
	function: Function;
}

function StatusBar({game}: GameObjectProp, update: string) {
	// todo
	const playerName = "<player name>";
	const action = game.next_action === Action.TURN ? "Turning Assam" : "Placing a carpet";
	return <>
		<h2 className='text-center'>
			{`\(TURN ${game.turn + 1}\) ${playerName}: ${action} `}
		</h2>
	</>
}

type ActionButtonsProp = {
	game: Game;
	rollCallback: Function;
	placeState: Placement;
	placeCallback: Function;
}

function ActionButtons({game, rollCallback, placeState, placeCallback}: ActionButtonsProp) {

	let rollButtonDisabled: boolean = game.next_action !== Action.TURN;
	let placeButtonDisabled: boolean = game.next_action !== Action.PLACE || !placeState.ready;

	return <div className='row'>
		<div className='col-6 col-md-12'>
			<button className='btn btn-primary m-2 w-100' disabled={rollButtonDisabled} onClick={() => rollCallback()}>
				Hodit kostkou
			</button>
		</div>
		<div className='col-6 col-md-12'>
			<button className='btn btn-primary m-2 w-100' disabled={placeButtonDisabled} onClick={() => placeCallback()}>
				Položit koberec
			</button>
		</div>
	</div>
}

function PlayersArea({game}: GameObjectProp) {

	// todo: get player name

	let players = [
		<div key='player-1'>
			Player 1: {game.players[0].dirhams} Dirham
		</div>,
		<div key='player-2'>
			Player 2: {game.players[1].dirhams} Dirham
		</div>,
		<div key='player-count'>{game.playercount}</div>
	]

	if (game.playercount > 2) {
		players.push(<div key='player-3'>
			Player 3: {game.players[2].dirhams} Dirham
		</div>)
	}
	if (game.playercount > 3) {
		players.push(<div key='player-4'>
			Player 4: {game.players[3].dirhams} Dirham
		</div>)
	}

	return <>
		{players}
	</>
}

function CarpetOverlapsTile(carpet: Carpet, [tile_x, tile_y]: [number, number]): boolean {
	if (carpet.x == tile_x && carpet.y == tile_y) {
		return true;
	}
	let sndtile = carpet.getSecondTile();
	if (sndtile.x == tile_x && sndtile.y == tile_y) {
		return true;
	}
	return false;
}

function GetFirstTileCandidates(board: gameBoard): Array<[number, number]> {
	let validPositions: Array<Carpet> = board.getValidPositions();
	let surroundingTiles: Array<[number, number]> = [
		[board.assam_x - 1, board.assam_y],
		[board.assam_x + 1, board.assam_y],
		[board.assam_x, board.assam_y - 1],
		[board.assam_x, board.assam_y + 1]
	];
	let tiles: Array<[number, number]> = [];

	for (let [tile_x, tile_y] of surroundingTiles) {
		if (board.isOutOfBounds(tile_x, tile_y)) { continue; }
		for (let carpet of validPositions) {
			if (CarpetOverlapsTile(carpet, [tile_x, tile_y])) {
				tiles.push([tile_x, tile_y]);
				break;
			}
 		}
	}

	return tiles;
}

function GetCarpetCandidates(board: gameBoard, firstTile: [number, number]): Array<[Carpet, [number, number]]> {
	let candidates: Array<[Carpet, [number, number]]> = [];

	let carpets = board.getValidPositions();

	for (let carpet of carpets) {
		
		// eliminate pointless carpets
		if (!CarpetOverlapsTile(carpet, firstTile)) { continue; }

		let sndtile = carpet.getSecondTile();
		let [tile_x, tile_y] = firstTile;

		if (carpet.x == tile_x && carpet.y == tile_y) {
			candidates.push([carpet, [sndtile.x, sndtile.y]]);
			continue;
		}
		
		// otherwise it's the secondtile that overlaps
		candidates.push([carpet, [carpet.x, carpet.y]]);
	}

	return candidates;
}

type BoardProp = {
	game: Game;
	turnState: TurnDirection;
	turnCallback: Function;
	placeState: Placement;
	placeCallback: Function;
	hash: string;
}

function Board({ game, turnState, turnCallback, placeState, placeCallback, hash }: BoardProp) {
	const tiles = [];
	const deg = Array(270,180,90,0)[game.board.assam_dir];
	const style = {
		top:  `calc((100% * ${game.board.assam_y + 1} / 9) - 2.5px)`,
		left: `calc((100% * ${game.board.assam_x + 1} / 9) - 2.5px)`,
		// rotate Assam
		transform: `rotate(${deg.toString()}deg)`,
	}

	function selectFirstTile(x:number, y:number) {
		placeState.firstTile = true;
		placeState.tile1_x = x;
		placeState.tile1_y = y;
		placeCallback(placeState);
	}

	function selectSecondTile(carpet: Carpet) {
		placeState.ready = true;
		placeState.carpet = carpet;
		placeCallback(placeState);
	}

	let tileCandidates: Array<[number, number]> = [];
	let carpetCandidates: Array<[Carpet, [number, number]]> = [];
	if (game.next_action === Action.PLACE) {
		if (!placeState.firstTile) {
			tileCandidates = GetFirstTileCandidates(game.board);
		} else {
			carpetCandidates = GetCarpetCandidates(game.board, [placeState.tile1_x, placeState.tile1_y]);
		}
	}

	// generate tiles
	for (let y = -1; y < 8; y++) {
		const row = []
		for (let x = -1; x < 8; x++) {
			// calculate tile style and callback
			let tileStyle = '';
			let tileCallback = () => {};

			if (tileCandidates.length > 0) {
				for (let [candidate_x, candidate_y] of tileCandidates) {
					if (candidate_x !== x || candidate_y !== y) { continue; }
					tileStyle = 'tilehighlight';
					tileCallback = () => selectFirstTile(x, y);
				}
			}
			if (carpetCandidates.length > 0) {
				if (placeState.tile1_x === x && placeState.tile1_y === y) {
					tileStyle = 'tilehighlight';
				} else {
					for (let [carpet, [candidate_x, candidate_y]] of carpetCandidates) {
						if (candidate_x !== x || candidate_y !== y) { continue; }
						tileStyle = 'tilehighlight';
						tileCallback = () => selectSecondTile(carpet);
					}
				}
			}

			row.push(<Tile key={x+"-"+y} game={game} coordX={x} coordY={y} highlight_style={tileStyle} onClickCallback={tileCallback}/>);
		}
	  tiles.push(<div key={y} className='row'>{row}</div>)
	}

	// set arrow highlight
	let left_highlight = 'hidden';
	let right_highlight = 'hidden';
	let straight_highlight = 'hidden';

	if (game.next_action === Action.TURN) {
		left_highlight = turnState === TurnDirection.LEFT ? 'highlight' : 'nohighlight';
		right_highlight = turnState === TurnDirection.RIGHT ? 'highlight' : 'nohighlight';
		straight_highlight = turnState === TurnDirection.STRAIGHT ? 'highlight' : 'nohighlight';
	}

	return <div className='w-100 col-12 col-md-8 position-relative'>
		<div id="assam" className='assam' style={style}>
			<img className='assam-img' src={assam}/>
			<span className={`assam-arrow arrow-left ${left_highlight}`} onClick={() => turnCallback(TurnDirection.LEFT)}>
				<FaArrowRight />
  			</span>
			<span className={`assam-arrow arrow-right ${right_highlight}`} onClick={() => turnCallback(TurnDirection.RIGHT)}>
			  	<FaArrowLeft />
  			</span>
			<span className={`assam-arrow arrow-straight ${straight_highlight}`} onClick={() => turnCallback(TurnDirection.STRAIGHT)}>
				<FaArrowDown />
  			</span>
		</div>
		{tiles}
	</div>
}
  
function Tile({ game, coordX, coordY, highlight_style, onClickCallback }: TileProp) {
	
	// clear border tiles
	if (coordX < 0 || coordY < 0 || coordX >= 7 || coordY >= 7) {
  
	  let arcDir = 'rotate(270deg)';
	  if (coordY < 0 && coordX < 7) {
		arcDir = coordX % 2 ? 'rotate(0deg)' : 'rotate(90deg)';
	  }
	  if (coordX >= 7 && coordY < 7) {
		arcDir = coordY % 2 ? 'rotate(180deg)' : 'rotate(90deg)';
	  }
	  if (coordY >= 7 && coordX >= 0) {
		arcDir = coordX % 2 ? 'rotate(180deg)' : 'rotate(270deg)';
	  }
	  if (coordX < 0 && coordY >= 0) {
		arcDir = coordY % 2 ? 'rotate(0deg)' : 'rotate(270deg)'
	  }
  
	  // override corners
	  if (coordX === 7 && coordY === -1) {
		arcDir = 'rotate(270deg)';
	  }
	  if (coordX === -1 && coordY === 7) {
		arcDir = 'rotate(90deg)';
	  }
  
	  return <div className="tile">
		<img src={arc} className="floor" style={{transform: arcDir}}/>
	  </div>;
	} 
  
	let floorSrc = empty;
	const color = game.board.color(coordX, coordY);
	const dir = game.board.direction(coordX, coordY);
	const dirTransform: string = GetDirectionalTransform(dir);
  
	if (color) {
	  floorSrc = Array(red_half, blue_half, yellow_half, orange_half)[color-1];
	}
	
	const content = <img src={floorSrc} className='floor' style={{transform:dirTransform}}/>;  
	return <div className={`tile ${highlight_style}`} onClick={() => onClickCallback()}>
		{content}
	</div>;
}
  
export default function App() {
	const { id } = useParams();

	const [gameState, setGameState] = useState(new Game([
		new Player([Color.RED, Color.RED], 30),
		new Player([Color.BLUE, Color.BLUE], 30)
	]));
	const [hash, setHash] = useState("");
	const [modified, setModified] = useState("");
	// handle assam movement
	const [turnState, setTurnState] = useState(TurnDirection.STRAIGHT);
	let refresh: NodeJS.Timer;

	useEffect(() => {
		if (!refresh) {
			refresh = setInterval(() => {
				fetchGame();
			}, 2000)
		}
	}, []);

	async function fetchGame() {		
		const res = await API.graphql(graphqlOperation(getGame, { id })) as GQLRes;
		setModified(res.data.getGame.modified);
		gameState.board.setValues(res.data.getGame.board);
		// gameState.players = res.data.getGame.players;
		setGameState(gameState);
		setHash(String(Math.random()));
	}

	async function roll() {
		if (turnState !== TurnDirection.STRAIGHT) {
			if (turnState === TurnDirection.LEFT) gameState.board.turnAssam(false);
			if (turnState === TurnDirection.RIGHT) gameState.board.turnAssam(true);
		}
		setTurnState(TurnDirection.STRAIGHT);
		const moves = Array(1,2,2,3,3,4)[Math.floor(Math.random()*6)];
		gameState.board.moveAssam(moves);
		gameState.next_action = Action.PLACE;

		await API.graphql(graphqlOperation(updateGame, { id, modified, players: gameState.players, board: gameState.board })) as GQLRes;;
	}

	// handle carpet placement
	const [placeState, setPlaceState] = useState(new Placement());

	async function place() {

		// by now, the Placement is ready
		if (placeState.carpet == null) {
			alert('place called with null carpet');
			return;
		}

		// define carpet
		const newCarpet = placeState.carpet;
		newCarpet.color = gameState.players[gameState.next_player].getTopCarpet();

		// move carpet to board
		try {
			gameState.board.placeCarpet(newCarpet);
		} catch (Exception) {
			console.log(gameState.board.top_carpets);
			console.log()

			throw Exception;
		}
		gameState.players[gameState.next_player].deck.shift();

		// update turn
		gameState.next_action = Action.TURN;
		gameState.next_player += 1;
		if (gameState.next_player >= gameState.playercount) {
			gameState.next_player = 0;
			gameState.turn += 1;
		}

		// reset place state
		setPlaceState(new Placement());

		// update game state
		await API.graphql(graphqlOperation(updateGame, { id, modified, players: gameState.players, board: gameState.board })) as GQLRes;;
	}


	return <div className='container'>
		<div className='row'>
			<StatusBar game={gameState}/>
			<div className='col-12 col-md-8'>
				<Board
					game={gameState}
					turnState={turnState} turnCallback={setTurnState}
					placeState={placeState} placeCallback={setPlaceState}
					hash={hash}
				/>
			</div>
			<div className='col-12 col-md-4 d-flex flex-column justify-content-center'>
				<div className='row'>
					<div className='col-12'>
						<ActionButtons game={gameState} rollCallback={roll} placeState={placeState} placeCallback={place} />
					</div>
					<div className='col-12'>
						<PlayersArea game={gameState} />
					</div>
				</div>
			</div>
		</div>
	</div>
}
  