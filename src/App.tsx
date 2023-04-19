import React, { EventHandler, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { BindingElement } from 'typescript';

// game state
import { Color, Direction, Player, Game, Carpet } from './game';

// images
import blue_half from './assets/carpets/blue.png'
import blue_full from './assets/carpets/blue_complete.png'
import orange_half from './assets/carpets/orange.png'
import orange_full from './assets/carpets/orange_complete.png'
import red_half from './assets/carpets/red.png'
import red_full from './assets/carpets/red_complete.png'
import yellow_half from './assets/carpets/yellow.png'
import yellow_full from './assets/carpets/yellow_complete.png'
import empty from './assets/carpets/empty.png'

import arc from './assets/arc.png'
import assam from './assets/assam.png'
import pointer from './assets/pointer.png'
import dirham from './assets/dirham.png'

const colors_half = [
  blue_half, orange_half, red_half, yellow_half
];
const colors_full = [
  blue_full, orange_full, red_full, yellow_full
];

function GetDirectionalTransform(direction: Direction): string {
  return 'rotate('+Array(180,90,0,270)[direction]+'deg)';
}

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/

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
    <GameArea game={gameState} />
    <PlayerArea game={gameState} />
    <OpponentsArea game={gameState} />
  </div>
}

type ArrowProp = {
  game: Game;
  direction: Direction;
}

function GameArea({game}: GameObjectProp) {
  return <div className='gameArea'>
    <Board game={game}/>
    <Arrow game={game} direction={Direction.NORTH}/>
    <Arrow game={game} direction={Direction.EAST}/>
    <Arrow game={game} direction={Direction.WEST}/>
    <Arrow game={game} direction={Direction.SOUTH}/>
  </div>
}

function Arrow({game, direction}: ArrowProp) {
  return <img src={pointer} className={'arrow arrow--'+direction}/>
}

function Board({ game }: GameObjectProp) {
  let tiles = [];
  
  for (let y = -1; y < 8; y++) {
    for (let x = -1; x < 8; x++) {
      tiles.push(<Tile game={game} coordX={x} coordY={y}/>);
    }
  }

  return <div className='boardArea'>
    <div className='boardGrid'>
      {tiles}
    </div>
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
  
  if (game.board.assam_x == coordX && game.board.assam_y == coordY) {
    const assamDir = game.board.assam_dir;
    const assamTransform: string = GetDirectionalTransform(assamDir);
    content = <>
      <img src={floorSrc} className='floor' style={{transform:dirTransform}}/>
      <img src = {assam} className='assam' style={{transform:assamTransform}}/>
    </>;
  } else {
    content = <img src={floorSrc} className='floor' alt={dirTransform} style={{transform:dirTransform}}/>;
  }

  return <div key={(coordY*9 + coordX).toString()} className="tile">{content}</div>;
}

function PlayerArea({ game }: GameObjectProp) {
  // TODO: track CURRENTLY displayed player

  return <div className='playerArea'>
    <b>Player Area:</b>
    <FullCarpet/>

    <button>Roll</button>
    <div>Dirhams: {game.players[0].dirhams}</div>
  </div>
}

function OpponentsArea({ game }: GameObjectProp) {
  return <div className='oppArea'>
  <b>Opponents:</b>
  <img src={blue_half} style={{width:"10px"}} />
  {game.players[1].dirhams}
  </div>
}

function FullCarpet() {
  return <img src={red_full}/>
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
