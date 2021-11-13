import { Display } from './display.js';
import { State } from "./State.js"

function runAnimation(funcframe) {
	let lastTime;
	function frame(time) {
		let deltaTime = (time - (lastTime ?? 0)) / 1000.0;
		if (!funcframe(deltaTime)) return
		lastTime = time;
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

async function runGame() {
	await runLevel();
	runGame();
}

async function runLevel() {
	let display = new Display();
	await display.load();
	let state = new State(display);
	let ending = 1;
	return new Promise(resolve => {
		runAnimation(time => {
			let status;
			if (ending === 1)
				status = state.update(time);
			display.render(state);
			if (status)
				return true;
			else if (ending > 0 && state.status !== "new game") {
				ending -= time;
				return true;
			}
			else {
				resolve(false);
				return false;
			}
		});
	})
}

window.onload = function () {
	runGame();
}
