import { API, graphqlOperation } from "aws-amplify";
import { Link } from "react-router-dom";
import listLobby from "../api/listLobby";
import { useEffect, useState } from "react";
import { GQLRes, Marrakech } from "../api/types";

export default function Lobby() {

	const [lobby, setLobby] = useState<Marrakech[]>([]);

	async function getLobby() {
		const res = await API.graphql(graphqlOperation(listLobby)) as GQLRes;
		setLobby(res.data.listLobby);
	}

	useEffect(() => {
		getLobby(); 
	}, []);

	return (
		<div className="containter d-flex flex-column justify-content-center h-100">
			<h3 className="text-center">
				Join lobby
			</h3>
			<table className="table table-striped">
				<thead>
					<tr>
					<th scope="col">ID</th>
					<th scope="col">Players/Total</th>
					<th scope="col">Action</th>
					</tr>
				</thead>
				<tbody>
					{
						lobby.map(row => <tr key={row.id}>
							<th scope="row">{row.id}</th>
							<td>{(row.players.filter(pl => pl.id !== null)).length}/{row.totalPlayers}</td>
							<td>
								<Link to={"/" + row.id + "/lobby"}>
									<button className="btn btn-success">Join game</button>
								</Link>
							</td>
						</tr>)
					}
				</tbody>
			</table>
			<div className="button-menu">
				<Link to="/">
					<button className="btn btn-secondary w-100">
						Back
					</button>
				</Link>
			</div>
		</div>
	);
  }
  