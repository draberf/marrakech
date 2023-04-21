import { useState } from "react";

export default function Options(props: { closeFunction: () => void }) {
	const [darkMode, setDarkMode] = useState(localStorage.getItem("_darkMode") === 'true');

	function setMode() {
		localStorage.setItem("_darkMode", String(!darkMode));
		
		if (!darkMode) {
			document.documentElement.setAttribute('data-bs-theme','dark')
		} else {
			document.documentElement.setAttribute('data-bs-theme','light')
		}
		setDarkMode(!darkMode);
	}

	return (
	<>
		<div className="options"></div>
		<div className="options-modal">
			<div className="modal-content p-2">
				<h3 className="text-center">
					Options
				</h3>
				<div>
					<input type="checkbox" id="darkMode" onClick={() => setMode()} defaultChecked={darkMode} />
					<label htmlFor="darkMode">Dark Mode</label>
				</div>
				<div className="text-center">
					<button 
						className="btn btn-success"
						onClick={() => props.closeFunction()}>
						Close
					</button>
				</div>
			</div>
		</div>
	</>);
}
  