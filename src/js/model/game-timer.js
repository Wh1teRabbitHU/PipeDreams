'use strict';

class GameTimer {

	constructor(forward = true) {
		this.forward = forward;

		this.time = 0;
		this.timerObj = null;
		this.onTimesUp = () => {};
	}

	get minutes() {
		let minutes = Math.floor(this.time / 60);

		return minutes < 10 ? '0' + minutes : minutes;
	}

	get seconds() {
		let seconds = this.time % 60;

		return seconds < 10 ? '0' + seconds : seconds;
	}

	start(infoPanel) {
		if (this.forward) {
			this.timerObj = setInterval(() => {
				this.time++;
				this.updateTimer(infoPanel);
			}, 1000);
		} else {
			this.timerObj = setInterval(() => {
				this.time--;
				this.updateTimer(infoPanel);

				if (this.time === 0 && typeof this.onTimesUp == 'function') {
					this.onTimesUp();
				}
			}, 1000);
		}
	}

	stop() {
		if (this.timerObj === null) {
			return;
		}

		clearInterval(this.timerObj);
	}

	reset() {
		this.stop();
		this.time = 0;
	}

	updateTimer(infoPanel) {
		infoPanel.updateTimer(this.minutes + ':' + this.seconds);
	}
}

module.exports = GameTimer;