import { Link } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import createGame from "../api/createGame";
import { startingConfig } from "../StartingConfig";
import { GQLRes } from "../api/types";


export default function CreateGame() {

	async function createNewGame() {
		const option = (document.querySelector('input[name=gameOption]:checked') as HTMLElement).id;
		const players = (document.querySelector('input[name=players]:checked') as HTMLElement).id as "players-2" | "players-3" | "players-4";

		let cachedId = localStorage.getItem("_userId");

		if (!cachedId) {
			cachedId = crypto.randomUUID();
			localStorage.setItem("_userId", cachedId);
		}

		const config = startingConfig[players] as any;
		if (option === 'private') {
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
							<input type="radio" name="players" className="btn-check" id="players-2" defaultChecked/>
							<label className="btn btn-outline-info small-radio" htmlFor="players-2">2</label>
							<input type="radio" name="players" className="btn-check" id="players-3"/>
							<label className="btn btn-outline-info small-radio" htmlFor="players-3">3</label>
							<input type="radio" name="players" className="btn-check" id="players-4"/>
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
							<input type="radio" name="gameOption" className="btn-check" id="private" defaultChecked/>
							<label className="btn btn-outline-info" htmlFor="private">Private</label>
							<input type="radio" name="gameOption" className="btn-check" id="public" />
							<label className="btn btn-outline-info" htmlFor="public">Public</label>
						</div>
					</div>
				</div>
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
  