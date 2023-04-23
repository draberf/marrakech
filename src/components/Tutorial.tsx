import { useState } from "react";
import { BsFillArrowLeftSquareFill, BsFillArrowRightSquareFill} from "react-icons/bs";
import { Link } from "react-router-dom";

// import image assets
import assam_arrows from '../assets/tutorial/assam_arrows.png'
import contiguous from '../assets/tutorial/contiguous.png'
import dirham_count from '../assets/tutorial/dirhams_count.png'
import game_end from '../assets/tutorial/dirhams_count.png'
import midgame from '../assets/tutorial/midgame.png'
import place_button from '../assets/tutorial/place_button.png'
import placement1 from '../assets/tutorial/placement1.png'
import placement2 from '../assets/tutorial/placement2.png'
import placement3 from '../assets/tutorial/placement3.png'
import placement4 from '../assets/tutorial/placement4.png'
import roll_button from '../assets/tutorial/roll_button.png'

export default function Tutorial() {
	const totalPages = 5;
	const [page, setPage] = useState(1);

	function changePage(value: number) {
		let newPage = (page + value - 1) % (totalPages) + 1;
		if (newPage === 0) {
			newPage = totalPages;
		}
		setPage(newPage);
	}

	return (
	<>
		<div className="containter d-flex flex-column justify-content-center h-100">
			<h3 className="text-center">
				Tutorial
			</h3>
			<div className="text-center">
				{page === 1 && <>
					Welcome to Marrakech! You are a market vendor hoping to impress Assam, the market owner, with your carpets.

					<img src={midgame}></img>
				</>}
				{page === 2 && <>
					At the start of your turn, you get to direct Assam to move straight or turn to his side.
					
					<img src={assam_arrows}></img>
					
					Then, you roll a die to determine how far Assam moves. Assam is more likely to move 2 or 3 steps.

					<img src={roll_button}></img>
				</>}
				{page === 3 && <>
					If Assam ends up standing on one of your opponent's carpets, you have to pay your opponent. Pay one Dirham for each space in the contiguous area that Assam is standing in. Likewise, your opponents will pay you if Assam steps on your carpets on your turn.

					<img src={contiguous}></img>

					<img src={dirham_count}></img>
				</>}
				{page === 4 && <>
					After Assam moves, you can place one of your carpets. It has to cover one space adjacent to Assam, so you have to select one such space like that, then the second to define the carpet placement. You cannot place a carpet to perfectly overlap another carpet.

					<img src={placement1}></img><img src={placement2}></img><img src={placement3}></img><img src={placement4}></img>

					<img src={place_button}></img>

					{'(If you are playing a game of two players, note that your deck consists of carpets of two colors. They do not form contiguous areas together.)'}
				</>}
				{page === 5 && <>
					The game ends when all players place their last carpet. The winner is the player with the most Dirhams added to the number of squares they have visible in the market.

					<img src={game_end}></img>
				</>}
			</div>
			<div className="text-center my-3">
				<BsFillArrowLeftSquareFill onClick={() => changePage(-1)}  className="mx-2 h2"/>
				<span className="user-select-none">
					{page} / {totalPages}
				</span>
				<BsFillArrowRightSquareFill onClick={() => changePage(+1)} className="mx-2 h2"/>
			</div>
			<div className="button-menu">
				<Link to="/">
					<button className="btn btn-secondary w-100">
						Back
					</button>
				</Link>
			</div>
		</div>
	</>);
}
  