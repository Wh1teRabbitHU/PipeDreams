'use strict';

const Kinetic   = require('kinetic');

const cookie    = require('./module/cookie');
const Block     = require('./model/block');
const GameTimer = require('./model/game-timer');

let width = 1280,
	height = 720,
	rows = 10,
	columns = 10,
	space = 5,
	layerSize = 5,
	level = 0,
	blockSize = Math.min(width, height) / Math.max(rows, columns) - space * 2,
	startingPointX = Math.floor(rows / 2),
	startingPointY = Math.floor(columns / 2);

let stage, gameType, gameDifficulty, layerRows, layerColumns, table, timer, information,
	menuLayer, difficultyLayer, timeTrialGameLayer, scoreBoardMenuLayer, informationMenuLayer,
	gameLayers, blocks;

function loadApplication() {
	width = window.innerWidth;
	height = window.innerHeight - 200;

	stage = new Kinetic.Stage({
		container: 'table',
		width: width,
		height: height
	});

	mainMenu();
}

function startNewClassicGame() {

	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	gameType = 'classic';

	switch (gameDifficulty) {
		case 'easy':
			rows = 5;
			columns = 5;
			break;
		case 'medium':
			rows = 10;
			columns = 10;
			break;
		case 'hard':
			rows = 15;
			columns = 15;
			break;
		default:
			break;
	}

	startingPointX = Math.floor(rows / 2);
	startingPointY = Math.floor(columns / 2);
	layerRows = Math.floor(rows / layerSize) + 1;
	layerColumns = Math.floor(columns / layerSize) + 1;
	blockSize = Math.min(width, height) / Math.max(rows, columns) - space * 2;

	table = new GameTable();
	table.generateFields();
	table.shuffle();
	table.drawGame();

	createTimer(true);
	information = new InformationPanel();

	timer.start(information);

	information.initPanel();
	information.updateScore(cookie.get('classic_high_score_' + gameDifficulty, '--/--'));
	information.hideLevel();
}

function startNewTimeTrialGame() {
	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	gameType = 'time-trial';

	level = 1;

	rows = 4 + level;
	columns = 4 + level;

	startingPointX = Math.floor(rows / 2);
	startingPointY = Math.floor(columns / 2);
	layerRows = Math.floor(rows / layerSize) + 1;
	layerColumns = Math.floor(columns / layerSize) + 1;
	blockSize = Math.min(width, height) / Math.max(rows, columns) - space * 2;

	table = new GameTable();
	table.generateFields();
	table.shuffle();
	table.drawGame();

	information = new InformationPanel();
	information.initPanel();

	createTimer(false);

	timer.start(information);
	timer.time = 120;

	information.updateScore(cookie.get('time_trial_score', '-'));
	information.updateTimer(timer.minutes + ':' + timer.seconds);
	information.updateLevel(level);
}

function startNextTimeTrialGame() {
	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	gameType = 'time-trial';

	level++;

	rows = 4 + level;
	columns = 4 + level;

	startingPointX = Math.floor(rows / 2);
	startingPointY = Math.floor(columns / 2);
	layerRows = Math.floor(rows / layerSize) + 1;
	layerColumns = Math.floor(columns / layerSize) + 1;
	blockSize = Math.min(width, height) / Math.max(rows, columns) - space * 2;

	table = new GameTable();
	table.generateFields();
	table.shuffle();
	table.drawGame();

	information = new InformationPanel();
	information.initPanel();

	timer.time = timer.time + 30 + level * 10;
	timer.start(information);

	information.updateScore(cookie.get('time_trial_score', '-'));
	information.updateTimer(timer.minutes + ':' + timer.seconds);
	information.updateLevel(level);
}

/*
function GameTimer() {
	// Options
	var inc = true;
	var timerObj = null;

	// States
	var currentTime = 0;
	var currentSec = 0;
	var currentMin = 0;

	this.setInc = function(value) {
		inc = value;
	};

	this.getCurrentTime = function() {
		return currentTime;
	};

	this.setCurrentTime = function(value) {
		currentTime = value;
		updateMinAndSec();
	};

	this.start = function() {
		if (inc) {
			timerObj = setInterval(refreshIncTimer, 1000);
		} else {
			timerObj = setInterval(refreshDecTimer, 1000);
		}
	};

	this.stop = function() {
		clearInterval(timerObj);
	};

	this.reset = function() {
		currentTime = 0;
		currentSec = 0;
		currentMin = 0;
	};

	this.getSec = function() {
		return currentSec;
	};

	this.getMin = function() {
		return currentMin;
	};

	function refreshIncTimer() {
		currentTime++;
		updateMinAndSec();
		information.updateTimer(currentMin + ':' + currentSec);
	}

	function refreshDecTimer() {
		currentTime--;
		updateMinAndSec();
		information.updateTimer(currentMin + ':' + currentSec);

		if (currentTime === 0) {
			timeTrialGameTimeUp();
		}
	}

	function updateMinAndSec() {
		currentMin = Math.floor(currentTime / 60);
		currentMin = currentMin < 10 ? '0' + currentMin : currentMin;
		currentSec = currentTime % 60;
		currentSec = currentSec < 10 ? '0' + currentSec : currentSec;
	}
}
*/

function mainMenu() {

	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	var classicGameText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 - 100,
		text: 'Classic game',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	classicGameText.setOffset({
		x: classicGameText.getWidth() / 2
	});

	var timeTrialGameText = new Kinetic.Text({
		x: width / 2,
		y: height / 3,
		text: 'Time trial',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	timeTrialGameText.setOffset({
		x: timeTrialGameText.getWidth() / 2
	});

	var scoreBoardText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 100,
		text: 'Scoreboard',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	scoreBoardText.setOffset({
		x: scoreBoardText.getWidth() / 2
	});

	var informationText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 200,
		text: 'Information',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	informationText.setOffset({
		x: informationText.getWidth() / 2
	});

	menuLayer = new Kinetic.Layer();
	menuLayer.name = 'gameMenu';
	menuLayer.add(classicGameText);
	menuLayer.add(timeTrialGameText);
	menuLayer.add(scoreBoardText);
	menuLayer.add(informationText);
	stage.add(menuLayer);

	// Event listeners
	var classicGameTextMouseOver = new Kinetic.Animation(function() {
		classicGameText.fill('black');
		this.stop();
	}, menuLayer);

	var classicGameTextMouseOut = new Kinetic.Animation(function() {
		classicGameText.fill('grey');
		this.stop();
	}, menuLayer);

	classicGameText.on('mouseover', function() {
		classicGameTextMouseOver.start();
	});

	classicGameText.on('mouseout', function() {
		classicGameTextMouseOut.start();
	});

	classicGameText.on('click', function() {
		classicDifficultySelectMenu();
	});

	var timeTrialGameTextMouseOver = new Kinetic.Animation(function() {
		timeTrialGameText.fill('black');
		this.stop();
	}, menuLayer);

	var timeTrialGameTextMouseOut = new Kinetic.Animation(function() {
		timeTrialGameText.fill('grey');
		this.stop();
	}, menuLayer);

	timeTrialGameText.on('mouseover', function() {
		timeTrialGameTextMouseOver.start();
	});

	timeTrialGameText.on('mouseout', function() {
		timeTrialGameTextMouseOut.start();
	});

	timeTrialGameText.on('click', function() {
		timeTrialGameMenu();
	});

	var scoreBoardTextMouseOver = new Kinetic.Animation(function() {
		scoreBoardText.fill('black');
		this.stop();
	}, menuLayer);

	var scoreBoardTextMouseOut = new Kinetic.Animation(function() {
		scoreBoardText.fill('grey');
		this.stop();
	}, menuLayer);

	scoreBoardText.on('mouseover', function() {
		scoreBoardTextMouseOver.start();
	});

	scoreBoardText.on('mouseout', function() {
		scoreBoardTextMouseOut.start();
	});

	scoreBoardText.on('click', function() {
		scoreBoardMenu();
	});

	var informationTextMouseOver = new Kinetic.Animation(function() {
		informationText.fill('black');
		this.stop();
	}, menuLayer);

	var informationTextMouseOut = new Kinetic.Animation(function() {
		informationText.fill('grey');
		this.stop();
	}, menuLayer);

	informationText.on('mouseover', function() {
		informationTextMouseOver.start();
	});

	informationText.on('mouseout', function() {
		informationTextMouseOut.start();
	});

	informationText.on('click', function() {
		informationMenu();
	});
}

function classicDifficultySelectMenu() {

	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	var easyText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 - 100,
		text: 'Easy (5x5)',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	easyText.setOffset({
		x: easyText.getWidth() / 2
	});

	var mediumText = new Kinetic.Text({
		x: width / 2,
		y: height / 3,
		text: 'Medium (10x10)',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	mediumText.setOffset({
		x: mediumText.getWidth() / 2
	});

	var hardText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 100,
		text: 'Hard (15x15)',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	hardText.setOffset({
		x: hardText.getWidth() / 2
	});

	var backText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 200,
		text: 'Back to the menu',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	backText.setOffset({
		x: backText.getWidth() / 2
	});

	// Layer setup
	difficultyLayer = new Kinetic.Layer();
	difficultyLayer.name = 'difficultySelectMenu';
	difficultyLayer.add(easyText);
	difficultyLayer.add(mediumText);
	difficultyLayer.add(hardText);
	difficultyLayer.add(backText);
	stage.add(difficultyLayer);

	// Easy menu
	var easyTextMouseOver = new Kinetic.Animation(function() {
		easyText.fill('black');
		this.stop();
	}, difficultyLayer);

	var easyTextMouseOut = new Kinetic.Animation(function() {
		easyText.fill('grey');
		this.stop();
	}, difficultyLayer);

	easyText.on('mouseover', function() {
		easyTextMouseOver.start();
	});

	easyText.on('mouseout', function() {
		easyTextMouseOut.start();
	});

	easyText.on('click', function() {
		gameDifficulty = 'easy';
		startNewClassicGame();
	});

	// Medium menu
	var mediumTextMouseOver = new Kinetic.Animation(function() {
		mediumText.fill('black');
		this.stop();
	}, difficultyLayer);

	var mediumTextMouseOut = new Kinetic.Animation(function() {
		mediumText.fill('grey');
		this.stop();
	}, difficultyLayer);

	mediumText.on('mouseover', function() {
		mediumTextMouseOver.start();
	});

	mediumText.on('mouseout', function() {
		mediumTextMouseOut.start();
	});

	mediumText.on('click', function() {
		gameDifficulty = 'medium';
		startNewClassicGame();
	});

	// Hard menu
	var hardTextMouseOver = new Kinetic.Animation(function() {
		hardText.fill('black');
		this.stop();
	}, difficultyLayer);

	var hardTextMouseOut = new Kinetic.Animation(function() {
		hardText.fill('grey');
		this.stop();
	}, difficultyLayer);

	hardText.on('mouseover', function() {
		hardTextMouseOver.start();
	});

	hardText.on('mouseout', function() {
		hardTextMouseOut.start();
	});

	hardText.on('click', function() {
		gameDifficulty = 'hard';
		startNewClassicGame();
	});

	// Back menu
	var backTextMouseOver = new Kinetic.Animation(function() {
		backText.fill('black');
		this.stop();
	}, difficultyLayer);

	var backTextMouseOut = new Kinetic.Animation(function() {
		backText.fill('grey');
		this.stop();
	}, difficultyLayer);

	backText.on('mouseover', function() {
		backTextMouseOver.start();
	});

	backText.on('mouseout', function() {
		backTextMouseOut.start();
	});

	backText.on('click', function() {
		mainMenu();
	});
}

function timeTrialGameMenu() {

	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	var timeTrialText = new Kinetic.Text({
		x: width / 2,
		y: height / 3,
		text: 'Starting time trial',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	timeTrialText.setOffset({
		x: timeTrialText.getWidth() / 2
	});

	var backText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 200,
		text: 'Back to the menu',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	backText.setOffset({
		x: backText.getWidth() / 2
	});

	// Layer setup
	timeTrialGameLayer = new Kinetic.Layer();
	timeTrialGameLayer.name = 'timeTrialGameLayer';
	timeTrialGameLayer.add(timeTrialText);
	timeTrialGameLayer.add(backText);
	stage.add(timeTrialGameLayer);

	// Time Trial menu
	var timeTrialTextMouseOver = new Kinetic.Animation(function() {
		timeTrialText.fill('black');
		this.stop();
	}, timeTrialGameLayer);

	var timeTrialTextMouseOut = new Kinetic.Animation(function() {
		timeTrialText.fill('grey');
		this.stop();
	}, timeTrialGameLayer);

	timeTrialText.on('mouseover', function() {
		timeTrialTextMouseOver.start();
	});

	timeTrialText.on('mouseout', function() {
		timeTrialTextMouseOut.start();
	});

	timeTrialText.on('click', function() {
		startNewTimeTrialGame();
	});

	// Back menu
	var backTextMouseOver = new Kinetic.Animation(function() {
		backText.fill('black');
		this.stop();
	}, timeTrialGameLayer);

	var backTextMouseOut = new Kinetic.Animation(function() {
		backText.fill('grey');
		this.stop();
	}, timeTrialGameLayer);

	backText.on('mouseover', function() {
		backTextMouseOver.start();
	});

	backText.on('mouseout', function() {
		backTextMouseOut.start();
	});

	backText.on('click', function() {
		mainMenu();
	});
}

function scoreBoardMenu() {
	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	var classicText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 - 100,
		text: 'Classic game',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	classicText.setOffset({
		x: classicText.getWidth() / 2
	});

	var easyText = new Kinetic.Text({
		x: width / 2 - 120,
		y: height / 3 - 40,
		text: 'Easy\n' + cookie.get('classic_high_score_easy', '99:99'),
		fontSize: 18,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	easyText.setOffset({
		x: easyText.getWidth() / 2
	});

	var mediumText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 - 40,
		text: 'Medium\n' + cookie.get('classic_high_score_medium', '99:99'),
		fontSize: 18,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	mediumText.setOffset({
		x: mediumText.getWidth() / 2
	});

	var hardText = new Kinetic.Text({
		x: width / 2 + 120,
		y: height / 3 - 40,
		text: 'Hard\n' + cookie.get('classic_high_score_hard', '99:99'),
		fontSize: 18,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	hardText.setOffset({
		x: hardText.getWidth() / 2
	});

	var timeTrialText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 40,
		text: 'Time trial',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	timeTrialText.setOffset({
		x: timeTrialText.getWidth() / 2
	});

	var levelText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 100,
		text: cookie.get('time_trial_score', '0') + '. level',
		fontSize: 18,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	levelText.setOffset({
		x: levelText.getWidth() / 2
	});

	var backText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 200,
		text: 'Back to the menu',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	backText.setOffset({
		x: backText.getWidth() / 2
	});

	// Layer setup
	scoreBoardMenuLayer = new Kinetic.Layer();
	scoreBoardMenuLayer.name = 'scoreBoardMenuLayer';
	scoreBoardMenuLayer.add(classicText);
	scoreBoardMenuLayer.add(easyText);
	scoreBoardMenuLayer.add(mediumText);
	scoreBoardMenuLayer.add(hardText);
	scoreBoardMenuLayer.add(timeTrialText);
	scoreBoardMenuLayer.add(levelText);
	scoreBoardMenuLayer.add(backText);
	stage.add(scoreBoardMenuLayer);

	// Back menu
	var backTextMouseOver = new Kinetic.Animation(function() {
		backText.fill('black');
		this.stop();
	}, scoreBoardMenuLayer);

	var backTextMouseOut = new Kinetic.Animation(function() {
		backText.fill('grey');
		this.stop();
	}, scoreBoardMenuLayer);

	backText.on('mouseover', function() {
		backTextMouseOver.start();
	});

	backText.on('mouseout', function() {
		backTextMouseOut.start();
	});

	backText.on('click', function() {
		mainMenu();
	});
}

function informationMenu() {

	if (stage.hasChildren()) {
		stage.destroyChildren();
	}

	var informationText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 - 100,
		text: '',
		fontSize: 18,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	let infoText = 'Game goal:\nTurn all the pipes into the correct position, so every pipe connected to each other!\n';

	infoText += 'In classic game you can choose between three different difficulty, while in time trial the difficulty is incrementaly increasing.\n';
	infoText += 'Time is key, so don\'t hesitate too much!\n';
	infoText += 'You can check your rank at the scoreboard!\n\nMade by: White Rabbit (Tamás Ruszka) (C) 2014,\nMail: ruszka dot tamas at gmail dot com';

	informationText.setText(infoText);

	informationText.setOffset({
		x: informationText.getWidth() / 2 > 0 ? informationText.getWidth() / 2 : 0
	});

	var backText = new Kinetic.Text({
		x: width / 2,
		y: height / 3 + 200,
		text: 'Back to the menu',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	backText.setOffset({
		x: backText.getWidth() / 2
	});

	// Layer setup
	informationMenuLayer = new Kinetic.Layer();
	informationMenuLayer.name = 'informationMenuLayer';
	informationMenuLayer.add(informationText);
	informationMenuLayer.add(backText);
	stage.add(informationMenuLayer);

	// Back menu
	var backTextMouseOver = new Kinetic.Animation(function() {
		backText.fill('black');
		this.stop();
	}, informationMenuLayer);

	var backTextMouseOut = new Kinetic.Animation(function() {
		backText.fill('grey');
		this.stop();
	}, informationMenuLayer);

	backText.on('mouseover', function() {
		backTextMouseOver.start();
	});

	backText.on('mouseout', function() {
		backTextMouseOut.start();
	});

	backText.on('click', function() {
		mainMenu();
	});
}

function GameTable() {
	gameLayers = [];

	for (let i = 0; i < layerRows; i++) {
		gameLayers[i] = new Array(layerColumns);
		for (let j = 0; j < layerColumns; j++) {
			gameLayers[i][j] = new Kinetic.Layer();
		}
	}

	blocks = [];

	this.generateFields = function() {
		var greater = 0;
		var smaller = 0;

		var generateIt = true;

		for (let i = 0; i < rows; i++) {
			blocks[i] = new Array(columns);
			for (let j = 0; j < columns; j++) {
				blocks[i][j] = new Block(i, j, i * columns + j, space, blockSize);
				// blocks[i][j].init(onClickBlock, boxAnimation);
			}
		}

		while (generateIt) {
			let x = Math.floor(Math.random() * rows),
				y = Math.floor(Math.random() * columns),
				currentBlock = blocks[x][y];

			generateIt = false;

			if (currentBlock.key !== 0) {
				var direction = Math.floor(Math.random() * 4 + 0);

				switch (direction) {
					case 0:
						if (x !== 0) {
							let leftBlock = blocks[x - 1][y];

							// Left
							if (typeof leftBlock != 'undefined') {
								if (currentBlock.key !== leftBlock.key) {
									currentBlock.left = true;
									leftBlock.right = true;
									greater = currentBlock.key > leftBlock.key ? currentBlock.key : leftBlock.key;
									smaller = currentBlock.key < leftBlock.key ? currentBlock.key : leftBlock.key;
									for (let i = 0; i < rows; i++) {
										for (let j = 0; j < columns; j++) {
											if (currentBlock.key === greater) {
												currentBlock.key = smaller;
											}
										}
									}
								}
							}
						}
						break;
					case 1:
						if (y !== 0) {
							let upBlock = blocks[x][y - 1];

							// Up
							if (typeof upBlock != 'undefined') {
								if (currentBlock.key !== upBlock.key) {
									currentBlock.up = true;
									upBlock.down = true;
									greater = currentBlock.key > upBlock.key ? currentBlock.key : upBlock.key;
									smaller = currentBlock.key < upBlock.key ? currentBlock.key : upBlock.key;
									for (let i = 0; i < rows; i++) {
										for (let j = 0; j < columns; j++) {
											if (blocks[i][j].key === greater) {
												blocks[i][j].key = smaller;
											}
										}
									}
								}
							}
						}
						break;
					case 2:
						if (x !== columns - 1) {
							let rightBlock = blocks[x + 1][y];

							// Right
							if (typeof rightBlock != 'undefined') {
								if (currentBlock.key !== rightBlock.key) {
									currentBlock.right = true;
									rightBlock.left = true;
									greater = currentBlock.key > rightBlock.key ? currentBlock.key : rightBlock.key;
									smaller = currentBlock.key < rightBlock.key ? currentBlock.key : rightBlock.key;
									for (let i = 0; i < rows; i++) {
										for (let j = 0; j < columns; j++) {
											if (blocks[i][j].key === greater) {
												blocks[i][j].key = smaller;
											}
										}
									}
								}
							}
						}
						break;
					case 3:
						if (y !== rows - 1) {
							let downBlock = blocks[x][y + 1];

							// Down
							if (typeof downBlock != 'undefined') {
								if (currentBlock.key !== downBlock.key) {
									currentBlock.down = true;
									downBlock.up = true;
									greater = currentBlock.key > downBlock.key ? currentBlock.key : downBlock.key;
									smaller = currentBlock.key < downBlock.key ? currentBlock.key : downBlock.key;
									for (let i = 0; i < rows; i++) {
										for (let j = 0; j < columns; j++) {
											if (blocks[i][j].key === greater) {
												blocks[i][j].key = smaller;
											}
										}
									}
								}
							}
						}
						break;
					default:
						break;
				}
			}
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < columns; j++) {
					if (blocks[i][j].key > 0) {
						generateIt = true;
					}
				}
			}
		}
		// blocks[startingPointX][startingPointY].connected = true;
		// blocks[startingPointX][startingPointY].connectionHandler(true);
	};

	this.shuffle = function() {
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < columns; j++) {
				blocks[i][j].shuffleIt();
			}
		}
	};

	this.drawGame = function() {

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				blocks[i][j].init(onClickBlock, boxAnimation, width, rows);

				gameLayers[Math.floor(i / layerSize)][Math.floor(j / layerSize)].add(blocks[i][j].box);
			}
		}

		blocks[startingPointX][startingPointY].connected = true;
		blocks[startingPointX][startingPointY].connectionHandler(true);

		this.checkPipeConnections();
		for (let i = 0; i < layerRows; i++) {
			for (let j = 0; j < layerColumns; j++) {
				stage.add(gameLayers[i][j]);
			}
		}
	};

	this.checkPipeConnections = function() {
		var i = 0;
		var j = 0;

		for (i = 0; i < rows; i++) {
			for (j = 0; j < columns; j++) {
				blocks[i][j].connected = false;
				blocks[i][j].connectionHandler(false);
			}
		}
		blocks[startingPointX][startingPointY].connected = true;
		blocks[startingPointX][startingPointY].connectionHandler(true);

		// Iterate throught the matrix
		for (i = 0; i < rows; i++) {
			for (j = 0; j < columns; j++) {
				// If current element is connecting
				if (blocks[i][j].connected) {
					var updated = false;
					// Left

					if (i !== 0 && !updated) {
						if (blocks[i][j].left && blocks[i - 1][j].right) {
							if (!blocks[i - 1][j].connected) {
								blocks[i - 1][j].connected = true;
								blocks[i - 1][j].connectionHandler(true);
								i = 0;
								j = -1;
								updated = true;
							}
						}
					}
					// Right
					if (i !== rows - 1 && !updated) {
						if (blocks[i][j].right && blocks[i + 1][j].left) {
							if (!blocks[i + 1][j].connected) {
								blocks[i + 1][j].connected = true;
								blocks[i + 1][j].connectionHandler(true);
								i = 0;
								j = -1;
								updated = true;
							}
						}
					}
					// Up
					if (j !== 0 && !updated) {
						if (blocks[i][j].up && blocks[i][j - 1].down) {
							if (!blocks[i][j - 1].connected) {
								blocks[i][j - 1].connected = true;
								blocks[i][j - 1].connectionHandler(true);
								i = 0;
								j = -1;
								updated = true;
							}
						}
					}
					// Down
					if (j !== columns - 1 && !updated) {
						if (blocks[i][j].down && blocks[i][j + 1].up) {
							if (!blocks[i][j + 1].connected) {
								blocks[i][j + 1].connected = true;
								blocks[i][j + 1].connectionHandler(true);
								i = 0;
								j = -1;
								updated = true;
							}
						}
					}
				}
			}
		}
	};
}

function InformationPanel() {

	var x = width / 2 + rows * blockSize / 2 + rows * (space * 2);
	var y = 0;
	var panelWidth = width - (x + rows * space * 2);
	var panelHeight = height;

	var informationLayer = new Kinetic.Layer();

	var panel = new Kinetic.Group({
		x: x,
		y: y,
		width: panelWidth,
		height: panelHeight
	});

	var timerGroup = new Kinetic.Group({
		x: 0,
		y: 0,
		width: x - width,
		height: height
	});

	var score = new Kinetic.Group({
		x: 0,
		y: 0,
		width: x - width,
		height: height
	});

	var levelGroup = new Kinetic.Group({
		x: 0,
		y: 0,
		width: x - width,
		height: height
	});

	var backText = new Kinetic.Text({
		x: 200,
		y: 200,
		text: 'Back',
		fontSize: 48,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	var timerTitleText = new Kinetic.Text({
		x: 30,
		y: 50,
		text: 'Time:',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	var timerText = new Kinetic.Text({
		x: 30,
		y: 100,
		text: '00:00',
		fontSize: 48,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	var scoreTitleText = new Kinetic.Text({
		x: 200,
		y: 50,
		text: 'Previous record:',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	var scoreText = new Kinetic.Text({
		x: 200,
		y: 100,
		text: '00:00',
		fontSize: 48,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	var levelTitleText = new Kinetic.Text({
		x: 30,
		y: 200,
		text: 'Actual level:',
		fontSize: 32,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	var levelText = new Kinetic.Text({
		x: 30,
		y: 250,
		text: '1',
		fontSize: 64,
		fontFamily: 'Calibri',
		fill: 'grey'
	});

	this.initPanel = function() {
		timerGroup.add(timerTitleText);
		timerGroup.add(timerText);
		score.add(scoreTitleText);
		score.add(scoreText);
		score.add(backText);
		levelGroup.add(levelTitleText);
		levelGroup.add(levelText);
		panel.add(timerGroup);
		panel.add(score);
		panel.add(levelGroup);
		informationLayer.add(panel);
		stage.add(informationLayer);
	};

	this.showTimer = function() {
		timerGroup.show();
		informationLayer.draw();
	};

	this.hideTimer = function() {
		timerGroup.hide();
		informationLayer.draw();
	};

	this.showScore = function() {
		score.show();
		informationLayer.draw();
	};

	this.scoreTimer = function() {
		score.hide();
		informationLayer.draw();
	};

	this.showLevel = function() {
		levelGroup.show();
		informationLayer.draw();
	};

	this.hideLevel = function() {
		levelGroup.hide();
		informationLayer.draw();
	};

	this.updateTimer = function(value) {
		timerText.setText(value);
		informationLayer.draw();
	};

	this.updateScore = function(value) {
		scoreText.setText(value);
		informationLayer.draw();
	};

	this.updateLevel = function(value) {
		levelText.setText(value);
		informationLayer.draw();
	};

	var backTextMouseOver = new Kinetic.Animation(function() {
		backText.fill('black');
		this.stop();
	}, informationLayer);

	var backTextMouseOut = new Kinetic.Animation(function() {
		backText.fill('grey');
		this.stop();
	}, informationLayer);

	backText.on('mouseover', function() {
		backTextMouseOver.start();
	});

	backText.on('mouseout', function() {
		backTextMouseOut.start();
	});

	backText.on('click', function() {
		mainMenu();
	});
}

function classicGameFinished() {
	timer.stop();

	setTimeout(function() {

		var newRecord = false;

		if (cookie.get('classic_high_score_' + gameDifficulty) === null) {
			newRecord = true;
		} else if (cookie.get('classic_high_score_' + gameDifficulty) > timer.minutes + ' : ' + timer.seconds) {
			newRecord = true;
		}

		// eslint-disable-next-line no-alert
		alert('Congratulation, you solved the level! \nYour time: ' + timer.minutes + ' : ' + timer.seconds + (newRecord ? '\nNew record!' : ''));
		if (newRecord) {
			cookie.set('classic_high_score_' + gameDifficulty, timer.minutes + ' : ' + timer.seconds);
		}

		mainMenu();

	}, 300);
}

function timeTrialGameFinished() {
	timer.stop();

	startNextTimeTrialGame();
}

function checkGameStatus() {
	var finished = true;

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			if (!blocks[i][j].connected) {
				finished = false;
			}
		}
	}

	if (finished) {
		if (gameType === 'classic') {
			classicGameFinished();
		} else if (gameType === 'time-trial') {
			timeTrialGameFinished();
		}
	} else {
		for (let i = 0; i < layerRows; i++) {
			for (let j = 0; j < layerColumns; j++) {
				gameLayers[i][j].draw();
			}
		}
	}
}

function onClickBlock(instance) {
	if (!instance.mouseClick.isRunning() && !instance.animationIsRunning) {
		instance.rotateRight();
		instance.mouseClick.start();
		setTimeout(function() {
			table.checkPipeConnections();
			checkGameStatus();
		}, 100);
	}
}

function boxAnimation(instance) {
	return new Kinetic.Animation(function() {
		instance.animationIsRunning = true;
		instance.box.rotate(5);
		if (instance.box.rotation() >= instance.rotation + 90) {
			instance.box.rotation(instance.rotation + 90);
			instance.rotation = instance.box.rotation();

			var finished = true;

			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < columns; j++) {
					if (!blocks[i][j].connected) {
						finished = false;
					}
				}
			}
			this.stop();
			instance.animationIsRunning = false;
			if (finished) {
				if (gameType === 'classic') {
					classicGameFinished();
				} else if (gameType === 'time-trial') {
					timeTrialGameFinished();
				}
			} else {
				for (let i = 0; i < layerRows; i++) {
					for (let j = 0; j < layerColumns; j++) {
						gameLayers[i][j].draw();
					}
				}
			}
		}
	}, gameLayers[Math.floor(instance.row / layerSize)][Math.floor(instance.column / layerSize)]);
}

function createTimer(forward) {
	if (typeof timer != 'undefined') {
		timer.reset();

		return;
	}

	timer = new GameTimer(forward);
	timer.onTimesUp = () => {
		timer.stop();

		setTimeout(function() {
			var newRecord = false;

			if (cookie.get('time_trial_score') === null) {
				newRecord = true;
			} else if (cookie.get('time_trial_score') < level) {
				newRecord = true;
			}

			// eslint-disable-next-line no-alert
			alert('Congratulation! \nYour level: ' + level + (newRecord ? '\nNew record!' : ''));

			if (newRecord) {
				cookie.set('time_trial_score', level);
			}

			mainMenu();
		}, 300);
	};
}

module.exports = {
	loadApplication: loadApplication
};