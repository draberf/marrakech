import { Link } from "react-router-dom";

export default function Lobby() {

	const tempData = [
		{
			id: "213543",
			players: [1,2],
			totalPlayers: 3,
		},
		{
			id: "213556",
			players: [1,2],
			totalPlayers: 4,
		},
	]

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
						tempData.map(row => <tr key={row.id}>
							<th scope="row">{row.id}</th>
							<td>{row.players.length}/{row.totalPlayers}</td>
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
  