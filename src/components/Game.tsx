import React, { EventHandler, useEffect, useRef, useState } from 'react';
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
import gone from '../assets/carpets/gone.png'


import arc from '../assets/arc.png'
import assam from '../assets/assam.png'
import dirham from '../assets/dirham.png'
import { FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { API, graphqlOperation } from 'aws-amplify';
import updateGame from '../api/updateGame';
import { useParams } from 'react-router-dom';
import { GQLRes } from '../api/types';
import getGame from '../api/getGame';
import Dice from 'react-dice-roll';

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

// assign the total of shown colors to each player
function CountAllColours(game: Game, colorAssignments: Array<number>) {
	const counts = [0,0,0,0];

	for (let y = 0; y < 7; y++) {
		for (let x = 0; x < 7; x++) {
			const color = game.board.color(x,y);
			if (color === Color.NONE) { continue; }

			counts[colorAssignments[color]]++;
		}
	}

	return counts;
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
	const action = game.next_action === Action.TURN ? "Turning Assam" : "Placing a carpet";
	return <>
		<h2 className='text-center'>
			{`\(TURN ${game.turn + 1}\) ${game.players[game.next_player].name}: ${action} `}
		</h2>
	</>
}

type ActionButtonsProp = {
	game: Game;
	rollCallback: Function;
	placeState: Placement;
	placeCallback: Function;
	resetCallback: Function;
}

function ActionButtons({game, rollCallback, placeState, placeCallback, resetCallback}: ActionButtonsProp) {
	const myTurn = IsMyTurn(game);
	let rollButtonDisabled: boolean = game.next_action !== Action.TURN && myTurn;
	let placeButtonDisabled: boolean = game.next_action !== Action.PLACE || !placeState.ready;
	let resetButtonDisabled: boolean = game.next_action !== Action.PLACE || !placeState.firstTile;

	return <div className='row'>
		<div className='col-4 col-md-10'>
			<button className='btn btn-primary m-2 w-100' disabled={(rollButtonDisabled || !myTurn)} onClick={() => rollCallback()}>
				Roll
			</button>
		</div>
		<div id="rolldice" className='col-1 col-md-2 d-flex flex-row justify-content-center align-items-center'>
			<Dice cheatValue={game.last_rolled as 1 | 2 | 3 | 4 | 5 | 6} size={30}/>
		</div>
		<div className='col-7 col-md-12'>
			<div className='d-flex flex-row justify-content-around row'>
				<div className='col-6'>
					<button className='btn btn-success m-2 w-100' disabled={placeButtonDisabled || !myTurn} onClick={() => placeCallback()}>
						Place
					</button>
				</div>
				<div className='col-6'>
					<button className='btn btn-danger m-2 w-100' disabled={resetButtonDisabled || !myTurn} onClick={() => resetCallback()}>
						Reset
					</button>
				</div>
			</div>
		</div>
	</div>
}

function IsMyTurn(game: Game): boolean {
	const id = localStorage.getItem("_userId");
	return game.players[game.next_player].id === id;
}

type PlayersAreaProp = {
	game: Game;
	colorAssignments: Array<number>;
}

function PlayersArea({game, colorAssignments}: PlayersAreaProp) {
	let i = 0;

	const colorCounts = CountAllColours(game, colorAssignments);

	let players = game.players.map(player => {
		const playerColorSrc = player.deck.length > 0 ?
			Array(red_full, blue_full, yellow_full, orange_full)[player.getTopCarpet()-1] :
			gone;
		
		const highlight = game.next_player === i ? 'playerHighlight playerLine' : 'playerLine';
		i++;
		
		return <tr key={'player-'+i} className={highlight}>
			<td>{game.players[i-1].name}:</td>
			<td><img src={playerColorSrc}></img> {player.deck.length}</td>
			<td><img src={dirham}></img> {player.dirhams}</td>
			<td># {colorCounts[i-1]}</td>
		</tr>
	})

	return <table className='table'><tbody>
		{players}
	</tbody></table>
}

function CarpetOverlapsTile(carpet: Carpet, [tile_x, tile_y]: [number, number]): boolean {
	if (carpet.x === tile_x && carpet.y === tile_y) {
		return true;
	}
	let sndtile = carpet.getSecondTile();
	if (sndtile.x === tile_x && sndtile.y === tile_y) {
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

		if (carpet.x === tile_x && carpet.y === tile_y) {
			candidates.push([carpet, [sndtile.x, sndtile.y]]);
			continue;
		}
		
		// otherwise it's the secondtile that overlaps
		candidates.push([carpet, [carpet.x, carpet.y]]);
	}

	return candidates;
}

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// @ts-ignore
function useInterval(callback, delay) {
	const savedCallback = useRef();
  
	useEffect(() => {
	  savedCallback.current = callback;
	});
  
	useEffect(() => {
	  function tick() {
		// @ts-ignore
		savedCallback.current();
	  }
  
	  let id = setInterval(tick, delay);
	  return () => clearInterval(id);
	}, [delay]);
}

type BoardProp = {
	game: Game;
	turnState: TurnDirection;
	turnCallback: Function;
	placeState: Placement;
	placeCallback: Function;
	colorAssignments: Array<number>;
	hash: string;
}

function Board({ game, turnState, turnCallback, placeState, placeCallback, colorAssignments, hash }: BoardProp) {
	const tiles = [];
	const deg = Array(270,180,90,0)[game.board.assam_dir];
	const style = {
		top:  `calc((100% * ${game.board.assam_y + 1} / 9) - 2.5px)`,
		left: `calc((100% * ${game.board.assam_x + 1} / 9) - 2.5px)`,
		// rotate Assam
		transform: `rotate(${deg.toString()}deg)`,
	}

	const myTurn = IsMyTurn(game);

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
	// add player check here
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

			if (placeState.ready && placeState.carpet) {
				const carpet = placeState.carpet;
				if (carpet.x === x && carpet.y === y) {
					tileStyle = 'tilehighlight';
				}
				if (carpet.getSecondTile().x === x && carpet.getSecondTile().y === y) {
					tileStyle = 'tilehighlight';
				}
			}

			if (!placeState.ready && tileCandidates.length > 0) {
				for (let [candidate_x, candidate_y] of tileCandidates) {
					if (candidate_x !== x || candidate_y !== y) { continue; }
					tileStyle = 'tilehighlight';
					tileCallback = () => selectFirstTile(x, y);
				}
			}
			if (!placeState.ready && carpetCandidates.length > 0) {
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

			// override if it's not your turn anyway
			if (!myTurn) {tileStyle = '';}

			row.push(<Tile key={x+"-"+y} game={game} coordX={x} coordY={y} highlight_style={tileStyle} onClickCallback={tileCallback}/>);
		}
	  tiles.push(<div key={y} className='row'>{row}</div>)
	}

	// set arrow highlight
	let left_highlight = 'hidden';
	let right_highlight = 'hidden';
	let straight_highlight = 'hidden';

	if (game.next_action === Action.TURN && IsMyTurn(game)) {
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

type FinalScoreElement = {
	name: string,
	score: number
}

export default function App() {
	const { id } = useParams();

	const [gameState, setGameState] = useState<Game>();
	const [gameFinished, setGameFinished] = useState(false);
	const [finalScores, setFinalScores] = useState([...Array<FinalScoreElement>(0)]);
	const [hash, setHash] = useState("");
	const [colorAssignments, setColorAssignments] = useState([-1, 0, 1, 0, 1]);
	const [modified, setModified] = useState("");
	// handle assam movement
	const [turnState, setTurnState] = useState(TurnDirection.STRAIGHT);

	useInterval(async () => {
		await fetchGame();
		console.log('Fetching new states..')
	}, 2000);

	async function fetchGame() {
		const res = await API.graphql(graphqlOperation(getGame, { id })) as GQLRes;
		const resData = res.data.getGame;
		setModified(resData.modified);
		if (!gameState) {
			const players = [];
			for (const player of resData.players) {
				players.push(new Player(
					player.deck,
					player.dirhams,
					player.id,
					player.name,
				))
			}
			const game = new Game(players);
			if (game.playercount > 2) {
				colorAssignments[3] = 2;
				colorAssignments[4] = 3;
			}
			setColorAssignments(colorAssignments);
			game.board.setValues(resData.board);
			game.setTurnInfo(resData.turnInfo)
			setGameState(game);
			setHash(String(Math.random()));
			return;
		}

		if (resData.players.map((player: any) => player.deck.length === 0).every((pl: any) => pl)) {

			
			if (finalScores.length == 0) {
				const colorPoints = CountAllColours(gameState, colorAssignments);

				for (let i = 0; i < gameState.playercount; i++) {
					finalScores.push({
						name: gameState.players[i].name,
						score: gameState.players[i].dirhams + colorPoints[i]
					});
				}

				setFinalScores(finalScores);
			}

			setGameFinished(true);
		}
		gameState.board.setValues(resData.board);
		gameState.setTurnInfo(resData.turnInfo);
		const players = resData.players;
		for (const id in gameState.players) {
			gameState.players[id].setValues(players[id].deck, players[id].dirhams)
		}
		setGameState(gameState);
		setHash(String(Math.random()));
	}

	async function roll() {
		if (gameState) {
			if (turnState !== TurnDirection.STRAIGHT) {
				if (turnState === TurnDirection.LEFT) gameState.board.turnAssam(false);
				if (turnState === TurnDirection.RIGHT) gameState.board.turnAssam(true);
			}
			setTurnState(TurnDirection.STRAIGHT);
			const moves = Array(1,2,2,3,3,4)[Math.floor(Math.random()*6)];
			gameState.last_rolled = moves;
			gameState.board.moveAssam(moves);

			// pay
			const colorUnderAssam = gameState.board.color(gameState.board.assam_x, gameState.board.assam_y);
			if (colorUnderAssam !== Color.NONE && colorAssignments[colorUnderAssam] !== gameState.next_player) {
				const amount = gameState.board.findContiguousUnderAssam().length;
				gameState.players[gameState.next_player].pay(amount);
				gameState.players[colorAssignments[colorUnderAssam]].receive(amount);
			}

			gameState.next_action = Action.PLACE;
			
			const turnInfo = {
				turn: gameState.turn,
				next_player: gameState.next_player,
				next_action: gameState.next_action,
				last_rolled: gameState.last_rolled,
			}
			const res = await API.graphql(graphqlOperation(updateGame, { id, modified, players: gameState.players, board: gameState.board, turnInfo: turnInfo })) as GQLRes;
			
			const dice = document.getElementById('rolldice')?.firstChild as HTMLElement;
			if (dice) {
				dice.setAttribute('cheatValue', String(gameState.last_rolled));
				dice.click();
			}
			setModified(res.data.updateGame.modified);
		}
	}

	// handle carpet placement
	const [placeState, setPlaceState] = useState(new Placement());

	async function place() {
		if (gameState) {
			// by now, the Placement is ready
			if (placeState.carpet === null) {
				alert('place called with null carpet');
				return;
			}

			// define carpet
			const newCarpet = placeState.carpet;
			newCarpet.color = gameState.players[gameState.next_player].getTopCarpet();

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

			const turnInfo = {
				turn: gameState.turn,
				next_player: gameState.next_player,
				next_action: gameState.next_action,
				last_rolled: gameState.last_rolled,
			}
			// update game state
			const res = await API.graphql(graphqlOperation(updateGame, { id, modified, players: gameState.players, board: gameState.board, turnInfo: turnInfo })) as GQLRes;
			setModified(res.data.updateGame.modified);
		}
	}

	function reset() {
		setPlaceState(new Placement());
	}


	return <div className='container'>
		{gameFinished && <div className='results-show'>
			<div className='text-center mt-2'>
				Game finished
			</div>
			{finalScores.slice().sort((playerA, playerB) => playerB.score - playerA.score).map((player, idx) => 
				<div className='mx-2'>
					{idx+1}. place: {player.name}: {player.score} points
				</div>
			)}
		</div>}
		{!gameState && <>
		<div className="spinner-border loading-animation" role="status">
		</div>
		<span className="loading-text">Loading...</span>
		</>}
		{gameState && 
		<div className='row'>
			<StatusBar game={gameState}/>
			<div className='col-12 col-md-8'>
				<Board
					game={gameState}
					turnState={turnState} turnCallback={setTurnState}
					placeState={placeState} placeCallback={setPlaceState}
					colorAssignments={colorAssignments}
					hash={hash}
				/>
			</div>
			<div className='col-12 col-md-4 d-flex flex-column justify-content-center'>
				<div className='row'>
					<div className='col-12'>
						<ActionButtons game={gameState} rollCallback={roll} placeState={placeState} placeCallback={place} resetCallback={reset}/>
					</div>
					<div className='col-12'>
						<PlayersArea game={gameState} colorAssignments={colorAssignments} />
					</div>
				</div>
			</div>
		</div>
		}
	</div>
}
  