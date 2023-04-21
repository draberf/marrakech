import { useState } from "react";

export default function Options(props: { closeFunction: () => void }) {
	const [darkMode, setDarkMode] = useState(localStorage.getItem("_darkMode") === 'true');
	const [sound, setGameSound] = useState(localStorage.getItem("_sound") === 'true');


	function setMode() {
		localStorage.setItem("_darkMode", String(!darkMode));
		
		if (!darkMode) {
			document.documentElement.setAttribute('data-bs-theme','dark')
		} else {
			document.documentElement.setAttribute('data-bs-theme','light')
		}
		setDarkMode(!darkMode);
	}

	function setSound() {
		localStorage.setItem("_sound", String(!sound));
		
		if (!sound) {
			(document.getElementById("music") as HTMLAudioElement).play();
		} else {
			(document.getElementById("music") as HTMLAudioElement).pause();
		}
		setGameSound(!sound);
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
					<label className="mx-2" htmlFor="darkMode">Dark Mode</label>
				</div>
				<div>
					<input type="checkbox" id="sound" onClick={() => setSound()} defaultChecked={sound} />
					<label className="mx-2" htmlFor="sound">Sound</label>
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
  