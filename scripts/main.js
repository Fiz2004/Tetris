import Display from './Display.js';
import State from './State.js';
import Controller from './controller.js';

const TIME_UPDATE_CONTROLLER = 80 / 1000;

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
	const state = new State(display.width, display.height);
	const controller = new Controller({
		37: 'left', 38: 'up', 39: 'right', 40: 'down',
	});
	document.getElementById('new_game').onclick = () => { state.status = 'new game'; };
	document.getElementById('pause').onclick = () => state.clickPause();
	let ending = 1;
	let deltaTime = 0;
	return new Promise((resolve) => {
		runAnimation((time) => {
			let status = true;
			deltaTime += time;
			if (state.status !== 'pause')
				if (deltaTime > TIME_UPDATE_CONTROLLER) {
					if (ending === 1) {
						status = null;
						status = state.update(time, controller);
					}
					deltaTime = 0;
				}

			display.render(state);

			if (status && ending === 1)
				return true;

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
		const deltaTime = Math.min(time - (lastTime ?? 0), 100) / 1000;
		if (!funcframe(deltaTime))
			return;

		lastTime = time;
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}
