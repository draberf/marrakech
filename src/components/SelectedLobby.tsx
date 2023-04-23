import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import getGame from "../api/getGame";
import { GQLRes, Player } from "../api/types";
import updateGame from "../api/updateGame";


export default function SelectedLobby() {
	const { id } = useParams();

	const [cacheId, setCacheId] = useState<string | null>(null);
	const [players, setPlayers] = useState<Player[]>([]);
	const [board, setBoard] = useState<Player[]>([]);
	const [modified, setModified] = useState("");
	const [refresh, setRefresh] = useState<NodeJS.Timer | null>(null);

	async function fetchGame() {		
		const res = await API.graphql(graphqlOperation(getGame, { id })) as GQLRes;
		setModified(res.data.getGame.modified);
		setPlayers(res.data.getGame.players);
		setBoard(res.data.getGame.board);
		if (res.data.getGame.players.filter((pl: any) => pl.id === null).length === 0) {
			window.location.href = `/${id}/game`;
		}	
	}

	function validateSelf(event: ChangeEvent) {
		const elem = (event.target as HTMLInputElement);
		if (!elem.value) {
			elem.classList.add('is-invalid');
		} else {
			elem.classList.remove('is-invalid');
		}
	}

	async function joinGame(idx: number) {
		const name = (document.getElementById('player-' + idx) as HTMLInputElement).value;
		if (!name) {
			document.getElementById('player-' + idx)?.classList.add('is-invalid');
			return;
		}

		const data = players;
		data[idx].id = cacheId as string;
		data[idx].name = name;
		const res = await API.graphql(graphqlOperation(updateGame, { id, modified, players: data, board: board })) as GQLRes;
		setPlayers(res.data.updateGame.players);
		setModified(res.data.updateGame.modified);
	}

	useEffect(() => {
		const id = localStorage.getItem("_userId");
		setCacheId(id)
		if (!id || id === 'null') {
			const newId = crypto.randomUUID();
			setCacheId(newId);
			localStorage.setItem("_userId", newId as string);
		}

		fetchGame();

		if (!refresh) {
			setRefresh(setInterval(() => {
				fetchGame();
			}, 3000))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className="containter d-flex flex-column justify-content-center h-100">
				<h3 className="text-center">
					Select players
				</h3>
				{
					players.map((row, idx) => <div key={idx} className="row text-center mb-2">		
						<div className="col-3">
							Player {idx + 1}
						</div>
						<div className="col-6">
							<input id={"player-" + idx } key={idx} className="form-control my-1" type="text" onChange={validateSelf} placeholder={"Player " + (idx + 1)} disabled={row.id !== null} />
						</div>
						<div className="col-3">
							{ !row.id &&
							<button className="btn btn-success" onClick={() => {joinGame(idx)}}>
								Join
							</button>
							}
							{ row.id && <div>
								Selected
							</div>}
						</div>
					</div>)
				}
			</div>
		</>
	);
  }
  