import React, { EventHandler, useState } from 'react';
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
import pointer from '../assets/pointer.png'
import dirham from '../assets/dirham.png'

const colors_half = [
  blue_half, orange_half, red_half, yellow_half
];
const colors_full = [
  blue_full, orange_full, red_full, yellow_full
];

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
  
  function GameWindow({ game }: GameObjectProp) {
  
	const [gameState, setGameState] = useState(game);
  
	return <div className='gameWindow'>
		<div className='row'>
			<StatusBar game={gameState}/>
			<div className='col-12 col-md-8'>
				<GameArea game={gameState} />
			</div>
			<div className='col-12 col-md-4 d-flex flex-column justify-content-center'>
				<div className='row'>
					<div className='col-12'>
						<ActionButtons game={gameState} />
					</div>
					<div className='col-12'>
						<PlayersArea game={gameState} />
					</div>
				</div>
			</div>
		</div>
	</div>
  }

  function StatusBar({game}: GameObjectProp) {
	return <>
		<h2 className='text-center'>
			Hrac cerveny - pokladani koberce
		</h2>
	</>
  }

  function ActionButtons({game}: GameObjectProp) {
	return <div className='row'>
		<div className='col-6 col-md-12'>
			<button className='btn btn-primary m-2 w-100'>
				Hodit kostkou
			</button>
		</div>
		<div className='col-6 col-md-12'>
			<button className='btn btn-primary m-2 w-100'>
				Položit koberec
			</button>
		</div>
	</div>
  }

  function PlayersArea({game}: GameObjectProp) {
	return <>
		<div>
			Player 1: 30 dirham
		</div>
		<div>
			Player 2: 25 dirham
		</div>
	</>
  }
  
  type ArrowProp = {
	game: Game;
	direction: Direction;
  }
  
  function GameArea({game}: GameObjectProp) {
	return <Board game={game}/>
  }

  function Board({ game }: GameObjectProp) {
	let tiles = [];
	
	for (let y = -1; y < 8; y++) {
		let row = []
		for (let x = -1; x < 8; x++) {
		row.push(<Tile key={x+"-"+y} game={game} coordX={x} coordY={y}/>);
	  }
	  tiles.push(<div className='row'>{row}</div>)
	}
  
	return <div className='w-100 col-12 col-md-8 position-relative'>
		<div id="assam" className='assam'>
			<img className='assam-img' src={assam}/>
		</div>
		{tiles}
	</div>
  }
  
  function Tile({ game, coordX, coordY }: TileProp) {
	if (coordX < 0 || coordY < 0 || coordX >= 7 || coordY >= 7) {
  
	  let arcDir: string = 'rotate(270deg)';
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
	  if (coordX == 7 && coordY == -1) {
		arcDir = 'rotate(270deg)';
	  }
	  if (coordX == -1 && coordY == 7) {
		arcDir = 'rotate(90deg)';
	  }
  
	  return <div key={(coordY*9 + coordX).toString()} className="tile">
		<img src={arc} className='floor' style={{transform: arcDir}}/>
	  </div>;
	}
  
	let content;
  
  
	let floorSrc = empty;
	const color = game.board.color(coordX, coordY);
	const dir = game.board.direction(coordX, coordY);
	const dirTransform: string = GetDirectionalTransform(dir);
  
  
	if (color) {
	  floorSrc = Array(red_half, blue_half)[color-1]
	}
	
	content = <img src={floorSrc} className='floor' alt={dirTransform} style={{transform:dirTransform}}/>;  
	return <div key={(coordY*9 + coordX).toString()} className="tile">{content}</div>;
  }
  
  // change this
export default function MockApp() {
	const game = new Game([
	  new Player([Color.RED, Color.RED], 30),
	  new Player([Color.BLUE, Color.BLUE], 30)
	]);
  
	game.board.placeCarpet(new Carpet(4,5,true,Color.RED));
	game.board.moveAssam(2);
	game.board.turnAssam(true);
  
	game.board.placeCarpet(new Carpet(0,0,false,Color.BLUE));
	game.board.placeCarpet(new Carpet(2,5,false,Color.RED));
  
	return <GameWindow game={game} />
}
  