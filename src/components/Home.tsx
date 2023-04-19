import { Link } from 'react-router-dom';

export default function Home() {
	return (
		<>
			<div className="containter d-flex flex-column justify-content-center h-100">
				<h2 className="text-center">
					Marrakech game
				</h2>
				<Link to="/createGame" className="d-flex justify-content-center button-menu">
					<button type="button" className="btn btn-primary mb-2 w-100">
						Start new game
					</button>
				</Link>
				<Link to="/lobby" className="d-flex justify-content-center button-menu">
					<button type="button" className="btn btn-primary mb-2 w-100">
						Browse lobby
					</button>
				</Link>
				<Link to="/tutorial" className="d-flex justify-content-center button-menu">
					<button type="button" className="btn btn-primary w-100">
						Tutorial
					</button>
				</Link>
			</div>
		</>
	);
}
