import { useState } from "react";
import { BsFillArrowLeftSquareFill, BsFillArrowRightSquareFill} from "react-icons/bs";
import { Link } from "react-router-dom";

export default function Tutorial() {
	const totalPages = 4;
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
					Basic rules
				</>}
				{page === 2 && <>
					Something2
				</>}
				{page === 3 && <>
					Something3
				</>}
				{page === 4 && <>
					Something4
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
  