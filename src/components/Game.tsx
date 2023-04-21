import React, { EventHandler, useEffect, useState } from 'react';
import { BindingElement } from 'typescript';

// game state
import { Color, Direction, Player, Game, Carpet } from '../game';

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
}

type FunctionalProp = {
	function: Function;
}

function StatusBar({game}: GameObjectProp, update: string) {
	// todo
	const colors = [
		'Player red turn',
		'Player blue turn',
		'Player yellow turn',
		'Player orange turn',
	];
	return <>
		<h2 className='text-center'>
			{colors[game.turn % game.playercount]}
		</h2>
	</>
}

type ActionButtonsProp = {
	game: Game;
	rollCallback: Function;
	placeCallback: Function;
}

function ActionButtons({game, rollCallback, placeCallback}: ActionButtonsProp) {

	let rollButtonDisabled: boolean = false;
	let placeButtonDisabled: boolean = false;

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

type BoardProp = {
	game: Game;
	turnState: TurnDirection;
	turnCallback: Function;
	hash: string;
}

function Board({ game, turnState, turnCallback, hash }: BoardProp) {
	const tiles = [];
	const deg = Array(270,180,90,0)[game.board.assam_dir];
	const style = {
		top:  `calc((100% * ${game.board.assam_y + 1} / 9) - 2.5px)`,
		left: `calc((100% * ${game.board.assam_x + 1} / 9) - 2.5px)`,
		// rotate Assam
		transform: `rotate(${deg.toString()}deg)`,
	}
	for (let y = -1; y < 8; y++) {
		const row = []
		for (let x = -1; x < 8; x++) {
			row.push(<Tile key={x+"-"+y} game={game} coordX={x} coordY={y}/>);
		}
	  tiles.push(<div key={y} className='row'>{row}</div>)
	}

	// set arrow highlight
	const left_highlight = turnState === TurnDirection.LEFT ? 'highlight' : 'nohighlight';
	const right_highlight = turnState === TurnDirection.RIGHT ? 'highlight' : 'nohighlight';
	const straight_highlight = turnState === TurnDirection.STRAIGHT ? 'highlight' : 'nohighlight';

  
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
  
function Tile({ game, coordX, coordY }: TileProp) {
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
  
	  return <div key={(coordY*9 + coordX).toString()} className="tile">
		<img src={arc} className='floor' style={{transform: arcDir}}/>
	  </div>;
	} 
  
	let floorSrc = empty;
	const color = game.board.color(coordX, coordY);
	const dir = game.board.direction(coordX, coordY);
	const dirTransform: string = GetDirectionalTransform(dir);
  
  
	if (color) {
	  floorSrc = Array(red_half, blue_half)[color-1]
	}
	
	const content = <img src={floorSrc} className='floor' alt={dirTransform} style={{transform:dirTransform}}/>;  
	return <div key={(coordY*9 + coordX).toString()} className="tile">{content}</div>;
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

		await API.graphql(graphqlOperation(updateGame, { id, modified, players: gameState.players, board: gameState.board })) as GQLRes;
	}

	function place() {

	}


	return <div className='container'>
		<div className='row'>
			<StatusBar game={gameState}/>
			<div className='col-12 col-md-8'>
				<Board game={gameState} turnState={turnState} turnCallback={setTurnState} hash={hash}/>
			</div>
			<div className='col-12 col-md-4 d-flex flex-column justify-content-center'>
				<div className='row'>
					<div className='col-12'>
						<ActionButtons game={gameState} rollCallback={roll} placeCallback={place} />
					</div>
					<div className='col-12'>
						<PlayersArea game={gameState} />
					</div>
				</div>
			</div>
		</div>
	</div>
}
  