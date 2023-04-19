export default function Options(props: { closeFunction: () => void }) {
	return (
	<>
		<div className="options"></div>
		<div className="options-modal">
			<div className="modal-content p-2">
				<h3 className="text-center">
					Options
				</h3>
				<div>
					<input type="checkbox" id="darkMode" />
					<label htmlFor="darkMode">Dark Mode/jazykove mutace/zvuk...</label>
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
  