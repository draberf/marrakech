import React, { EventHandler } from 'react';
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
import arrow from './assets/arrow.png'
import assam from './assets/assam.png'

const colors_half = [
  blue_half, orange_half, red_half, yellow_half
];
const colors_full = [
  blue_full, orange_full, red_full, yellow_full
];

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

type GameObjectProp = {
  game: Game;
}

type TileProp = {
  game: Game;
  coordX: number;
  coordY: number;
}

function GameWindow({ game }: GameObjectProp) {
  return <>
    <Board game={game} />
    <PlayerArea game={game} />
    <OpponentsArea game={game} />
  </>
}

function Board({ game }: GameObjectProp) {
  let tiles = [];
  
  for (let y = -1; y < 8; y++) {
    for (let x = -1; x < 8; x++) {
      tiles.push(<Tile game={game} coordX={x} coordY={y}/>);
    }
  }

  return <div className='boardGrid'>
    {tiles}
  </div>
}

function Tile({ game, coordX, coordY }: TileProp) {
  if (coordX < 0 || coordY < 0 || coordX >= 7 || coordY >= 7) {
    return <div key={(coordY*9 + coordX).toString()} className="tile">
      <img src={arc} className='floor' />
    </div>;
  }

  let content;


  let floorSrc = empty;
  const color = game.board.color(coordX, coordY);


  if (color) {
    floorSrc = Array(red_half, blue_half)[color-1]
  }
  
  if (game.board.assam_x == coordX && game.board.assam_y == coordY) {
    content = <><img src={floorSrc} className='floor'/><img src = {assam} className='assam' /></>;
  } else {
    content = <img src={floorSrc} className='floor'/>;
  }

  return <div key={(coordY*9 + coordX).toString()} className="tile">{content}</div>;
}

function PlayerArea({ game }: GameObjectProp) {
  // TODO: track CURRENTLY displayed player

  return <>
    <b>Player Area:</b>
    <img src={red_half} style={{width:"10%"}}/>
    <button>Roll</button>
    <div>Dirhams: {game.players[0].dirhams}</div>
  </>
}

function OpponentsArea({ game }: GameObjectProp) {
  return <>
  <b>Opponents:</b>
  <img src={blue_half} style={{width:"10%"}} />
  {game.players[1].dirhams}
  </>
}

// change this
export default function MockApp() {
  const game = new Game([
    new Player([Color.RED, Color.RED], 30),
    new Player([Color.BLUE, Color.BLUE], 30)
  ]);

  game.board.placeCarpet(new Carpet(4,5,true,Color.RED));

  return <GameWindow game={game} />
}
