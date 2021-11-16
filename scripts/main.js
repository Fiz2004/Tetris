import { Display } from './display.js';
import State from './State.js';
import Controller from './controller.js';

window.onload = function () {
	runGame();
};

async function runGame() {
	await runLevel();
	runGame();
}

async function runLevel() {
	const display = new Display();
	await display.load();
	const state = new State(display);
	const controller = new Controller({
		37: 'left', 38: 'up', 39: 'right', 40: 'down',
	});
	document.getElementById('new_game').onclick = () => { state.status = 'new game'; };
	document.getElementById('pause').onclick = () => state.clickPause();
	let ending = 1;
	return new Promise((resolve) => {
		runAnimation((time) => {
			let status;
			if (ending === 1) {
				status = state.update(time, controller);
			}
			display.render(state);

			if (status) {
				return true;
			}

			if (ending > 0 && state.status !== 'new game') {
				ending -= time;
				return true;
			}

			resolve(false);
			return false;
		});
	});
}

function runAnimation(funcframe) {
	let lastTime;
	function frame(time) {
		const mSecOfSec = 1000;
		const deltaTime = (time - (lastTime ?? 0)) / mSecOfSec;
		if (!funcframe(deltaTime)) {
			return;
		}
		lastTime = time;
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}
