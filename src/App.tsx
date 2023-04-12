import React, { EventHandler } from 'react';
import logo from './logo.svg';
import './App.css';
import { BindingElement } from 'typescript';

// game state
import { Color, Direction, Player, Game } from './game';

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

  </>
}

function Board({ game }: GameObjectProp) {
  
}

function Tile({ game, coordX, coordY }: TileProp) {

}

// change this
export default function MockApp() {
  const game = new Game([
    new Player([Color.RED, Color.RED], 30),
    new Player([Color.BLUE, Color.BLUE], 30)
  ]);

  return <GameWindow game={game} />
  return <div style={{position:"relative", width:"100px"}}>
    <img src={assam} className="assam"/>
    <img src={empty} className="floor"/>
  </div>
}
