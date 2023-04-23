import { Link } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import createGame from "../api/createGame";
import { startingConfig } from "../StartingConfig";
import { GQLRes } from "../api/types";
import { useState } from "react";


export default function CreateGame() {
	const [option, setOption] = useState("private");
	const [playerCount, setPlayerCount] = useState(0);

	async function createNewGame() {
		let cachedId = localStorage.getItem("_userId");

		if (!cachedId || cachedId === 'null') {
			cachedId = crypto.randomUUID();
			localStorage.setItem("_userId", cachedId);
			console.log(cachedId)
		}

		const players = ["players-2", "players-3", "players-4"] as Array<"players-2" | "players-3" | "players-4">;
		const config = startingConfig[players[playerCount]] as any;
		if (option === 'private') {
			for (let i = 0; i < playerCount + 2; i++) {
				let name = (document.getElementById('player-' + i) as HTMLInputElement).value;
				if (!name) name = 'Player ' + (i + 1);
				config.players[i].name = name;
			}
			config.lobby = false;
			config.players.map((player: any) => {player.id = cachedId });
			const game = await newGame(config) as GQLRes;
			window.location.href = `/${game.data.createGame.id}/game`;
		} else {
			config.lobby = true;
			const game = await newGame(config) as GQLRes;
			window.location.href = `/${game.data.createGame.id}/lobby`;
		}
	}

	async function newGame(config: any) {		
		const newGame = await API.graphql(graphqlOperation(createGame, { ...config }));
		return newGame;
	}

	return (
		<>
			<div className="containter d-flex flex-column justify-content-center h-100 pb-5">
				<h2 className="text-center pb-3">
					Create game
				</h2>
				<div className="d-flex justify-content-center">
					<div className="row">
						<div className="d-flex align-items-center mx-2">
							Players:
						</div>
						<div className="btn-group ">
							<input type="radio" name="players" className="btn-check" id="players-2" onClick={() => setPlayerCount(0)} defaultChecked/>
							<label className="btn btn-outline-info small-radio" htmlFor="players-2">2</label>
							<input type="radio" name="players" className="btn-check" id="players-3" onClick={() => setPlayerCount(1)}/>
							<label className="btn btn-outline-info small-radio" htmlFor="players-3">3</label>
							<input type="radio" name="players" className="btn-check" id="players-4" onClick={() => setPlayerCount(2)}/>
							<label className="btn btn-outline-info small-radio" htmlFor="players-4">4</label>
						</div>
					</div>
				</div>
				<div className="d-flex justify-content-center my-3">
					<div className="row">
						<div className="d-flex align-items-center mx-2">
							Game option:
						</div>
						<div className="btn-group">
							<input type="radio" name="gameOption" className="btn-check" id="private" onClick={() => setOption('private')} defaultChecked/>
							<label className="btn btn-outline-info" htmlFor="private">Private</label>
							<input type="radio" name="gameOption" className="btn-check" id="public" onClick={() => setOption('public')} />
							<label className="btn btn-outline-info" htmlFor="public">Public</label>
						</div>
					</div>
				</div>
				{ option === 'private' && 
				<div className="d-flex justify-content-center my-3">
					<div className="row">	
						<div className="name-input">
							<div className="d-flex align-items-center mx-2">
								Players name:
							</div>
							{
								Array.from(Array(playerCount + 2).keys()).map((id) => 
									<input id={"player-" + id } key={id} className="form-control my-1" type="text" placeholder={"Player " + (id + 1)} />
								)
							}
						</div>
					</div>
				</div> }
				<div className="d-flex justify-content-center">
					<Link to="/" className="mx-2">
						<div className="button-menu">
							<button className="btn btn-secondary w-100">
								Back
							</button>
						</div>
					</Link>
					<div className="mx-2 button-menu">
						<button className="btn btn-success w-100" onClick={createNewGame}>
							Create
						</button>
					</div>
				</div>
			</div>
		</>
	);
  }
  