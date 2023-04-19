import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import Home from './components/Home';
import Game from './components/Game';
import { BiCog } from 'react-icons/bi';
import Options from './components/Options';
import CreateGame from './components/CreateGame';
import SelectedLobby from './components/SelectedLobby';
import Lobby from './components/Lobby';
import Tutorial from './components/Tutorial';

export default function App() {
	const [optionsModal, setOptionsModal] = useState(false);

	function hideModal() {
		setOptionsModal(false);
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/:id/game/" element={<Game />} />
				<Route path="/createGame" element={<CreateGame />} />
				<Route path="/:id/lobby/" element={<SelectedLobby />} />
				<Route path="/lobby" element={<Lobby />} />
				<Route path="/tutorial" element={<Tutorial />} />
				<Route path="*" element={<Home />} />
			</Routes>
		<button onClick={() => setOptionsModal(true)} type="button" className="btn btn-primary options-button">
			<BiCog className='options-cog' />
		</button>
		{optionsModal && <Options closeFunction={hideModal} />}
		</BrowserRouter>
	);
}
