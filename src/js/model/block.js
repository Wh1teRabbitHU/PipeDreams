'use strict';

const kinetic = require('kinetic');

class Block {

	constructor(row, column, generateKey, space, blockSize) {
		this.row = row;
		this.column = column;
		this.generateKey = generateKey;
		this.space = space;
		this.blockSize = blockSize;

		this.x = this.row * (this.space * 2 + this.blockSize) + this.space;
		this.y = this.column * (this.space * 2 + this.blockSize) + this.space;
		this.up = false;
		this.left = false;
		this.down = false;
		this.right = false;
		this.key = this.generateKey;
		this.connected = false;
		this.rotation = 0;
		this.animationIsRunning = false;
	}

	init(onClickEvent, boxAnimation, width, rows) {
		this.box = new kinetic.Group({
			x: this.x + this.blockSize / 2 + (width - this.blockSize * rows) / 2 - this.blockSize / 2,
			y: this.y + this.blockSize / 2,
			width: this.blockSize,
			height: this.blockSize,
			offset: {
				x: this.blockSize / 2,
				y: this.blockSize / 2
			}
		});

		this.pipes = new kinetic.Group({
			x: 0,
			y: 0
		});

		this.shape = new kinetic.Rect({
			x: 0,
			y: 0,
			width: this.blockSize,
			height: this.blockSize,
			name: this.x + '-' + this.y,
			fill: 'grey',
			stroke: 'black',
			strokeWidth: this.space
		});

		var pipeUp = new kinetic.Line({
			points: [ this.blockSize / 2, 0, this.blockSize / 2, this.blockSize / 2 ],
			stroke: 'red',
			strokeWidth: 13,
			lineCap: 'round',
			name: 'pipeUp'
		});

		var pipeLeft = new kinetic.Line({
			points: [ 0, this.blockSize / 2, this.blockSize / 2, this.blockSize / 2 ],
			stroke: 'red',
			strokeWidth: 13,
			lineCap: 'round',
			name: 'pipeLeft'
		});

		var pipeDown = new kinetic.Line({
			points: [ this.blockSize / 2, this.blockSize, this.blockSize / 2, this.blockSize / 2 ],
			stroke: 'red',
			strokeWidth: 13,
			lineCap: 'round',
			name: 'pipeDown'
		});

		var pipeRight = new kinetic.Line({
			points: [ this.blockSize, this.blockSize / 2, this.blockSize / 2, this.blockSize / 2 ],
			stroke: 'red',
			strokeWidth: 13,
			lineCap: 'round',
			name: 'pipeRight'
		});

		// Placing pipes
		if (this.up) {
			this.pipes.add(pipeUp);
		}

		if (this.left) {
			this.pipes.add(pipeLeft);
		}

		if (this.down) {
			this.pipes.add(pipeDown);
		}

		if (this.right) {
			this.pipes.add(pipeRight);
		}

		this.box.on('click', () => onClickEvent(this));
		this.mouseClick = boxAnimation(this);

		this.box.add(this.shape);
		this.box.add(this.pipes);
	}

	connectionHandler(connected) {
		if (connected) {
			this.pipes.find('.pipeUp').stroke('green');
			this.pipes.find('.pipeLeft').stroke('green');
			this.pipes.find('.pipeDown').stroke('green');
			this.pipes.find('.pipeRight').stroke('green');
		} else {
			this.pipes.find('.pipeUp').stroke('red');
			this.pipes.find('.pipeLeft').stroke('red');
			this.pipes.find('.pipeDown').stroke('red');
			this.pipes.find('.pipeRight').stroke('red');
		}
	}

	shuffleIt() {
		for (var k = 0; k < Math.floor(Math.random() * 3); k++) {
			if (Math.random() < 0.5) {
				this.rotateRight();
			} else {
				this.rotateLeft();
			}
		}
	}

	rotateRight() {
		let temp = this.up;

		this.up = this.left;
		this.left = this.down;
		this.down = this.right;
		this.right = temp;
	}

	rotateLeft() {
		let temp = this.up;

		this.up = this.right;
		this.right = this.down;
		this.down = this.left;
		this.left = temp;
	}
}

module.exports = Block;