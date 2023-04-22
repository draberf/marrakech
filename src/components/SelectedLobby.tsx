import { useEffect, useState } from "react";
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

	async function joinGame(idx: number) {
		const data = players;
		data[idx].id = cacheId as string;
		const res = await API.graphql(graphqlOperation(updateGame, { id, modified, players: data, board: board })) as GQLRes;
		setPlayers(res.data.updateGame.players);
		setModified(res.data.updateGame.modified);
	}

	useEffect(() => {
		setCacheId(localStorage.getItem("_userId"))
		if (!cacheId) {
			setCacheId(crypto.randomUUID());
			localStorage.setItem("_userId", cacheId as string);
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
						<div className="col-7">
							Player {idx + 1}
						</div>
						<div className="col-5">
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
  