import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";


export default function SelectedLobby() {
	const { id } = useParams();
	let refresh: NodeJS.Timer;
	const [searchParams, setSearchParams] = useSearchParams();
	let user = searchParams.get("_userId")
	const cachedId = localStorage.getItem("_userId");

	useEffect(() => {
		if (!user || user != cachedId) {
			if (!cachedId) {
				user = crypto.randomUUID();
				setSearchParams({'_userId': user});
				localStorage.setItem("_userId", user);
			} else {
				setSearchParams({'_userId': cachedId});
				user = cachedId;
			}

		}

		if (!refresh) {
			refresh = setInterval(() => {
				console.log('aktualizuj, pokud uz jsou vsichni join tak redirect na game')
			}, 1000)
		}
	}, []);

	return (
		<>
			<div className="containter d-flex flex-column justify-content-center h-100">
				<h3 className="text-center">
					Select players
				</h3>
				
				<div className="row text-center mb-2">
					<div className="col-7">
						Player 1
					</div>
					<div className="col-5">
						<button className="btn btn-success">
							Join
						</button>
					</div>
				</div>
				<div className="row text-center">
					<div className="col-7">
						Player 2
					</div>
					<div className="col-5">
						<button className="btn btn-success">
							Join
						</button>
					</div>
				</div>
			</div>
		</>
	);
  }
  