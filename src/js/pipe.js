(function($) {
    //Default beállítások, globális változóban
    width = 1280;
    height = 720;
    rows = 10;
    columns = 10;
    space = 5;
    layerSize = 5;
    level = 0;
    animationIsRunning = false;

    blockSize = (Math.min(width, height) / Math.max(rows, columns)) - (space * 2);

    startingPointX = Math.floor(rows / 2);
    startingPointY = Math.floor(columns / 2);

    $(document).on("ready", function() {
        width = $(window).width();
        height = $(window).height() - 200;

        stage = new Kinetic.Stage({
            container: 'table',
            width: width,
            height: height
        });

        mainMenu();

    });

    function startNewClassicGame() {

        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        gameType = "classic";

        switch (gameDifficulty) {
            case "easy":
                rows = 5;
                columns = 5;
                break;
            case "medium":
                rows = 10;
                columns = 10;
                break;
            case "hard":
                rows = 15;
                columns = 15;
                break;
        }

        startingPointX = Math.floor(rows / 2);
        startingPointY = Math.floor(columns / 2);
        layerRows = Math.floor(rows / layerSize) + 1;
        layerColumns = Math.floor(columns / layerSize) + 1;
        blockSize = (Math.min(width, height) / Math.max(rows, columns)) - (space * 2);

        table = new gameTable();
        table.generateFields();
        table.shuffle();
        table.drawGame();

        timer = new gameTimer();
        information = new informationPanel();

        timer.setInc(true);
        timer.start();

        information.initPanel();
        information.updateScore(typeof $.cookie('classic_high_score_' + gameDifficulty) == 'undefined' ? "--/--" : $.cookie('classic_high_score_' + gameDifficulty));
        information.hideLevel();
    }

    function startNewTimeTrialGame() {
        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        gameType = "time-trial";

        level++;

        rows = 4 + level;
        columns = 4 + level;

        startingPointX = Math.floor(rows / 2);
        startingPointY = Math.floor(columns / 2);
        layerRows = Math.floor(rows / layerSize) + 1;
        layerColumns = Math.floor(columns / layerSize) + 1;
        blockSize = (Math.min(width, height) / Math.max(rows, columns)) - (space * 2);

        table = new gameTable();
        table.generateFields();
        table.shuffle();
        table.drawGame();

        if (typeof timer === 'undefined') {
            timer = new gameTimer();
        }
        timer.setInc(false);
        timer.setCurrentTime((timer.getCurrentTime() === 0 ? 80 : timer.getCurrentTime()) + 30 + (level * 10));
        timer.start();

        information = new informationPanel();
        information.initPanel();
        information.updateScore((typeof $.cookie('time_trial_score') == 'undefined') ? "-" : $.cookie('time_trial_score'));
        information.updateTimer(timer.getMin() + ':' + timer.getSec());
        information.updateLevel(level);
    }

    function gameTimer() {
        // Options
        var inc = true;
        var timerObj = null;

        //States
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
            information.updateTimer(currentMin + ":" + currentSec);
        }

        function refreshDecTimer() {
            currentTime--;
            updateMinAndSec();
            information.updateTimer(currentMin + ":" + currentSec);
            if (currentTime === 0) {
                timeTrialGameTimeUp();
            }
        }

        function updateMinAndSec() {
            currentMin = Math.floor(currentTime / 60);
            currentMin = currentMin < 10 ? "0" + currentMin : currentMin;
            currentSec = currentTime % 60;
            currentSec = currentSec < 10 ? "0" + currentSec : currentSec;
        }
    }

    function mainMenu() {

        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        var classicGameText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) - 100,
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
            y: (height / 3),
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
            y: (height / 3) + 100,
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
            y: (height / 3) + 200,
            text: 'Information',
            fontSize: 32,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        informationText.setOffset({
            x: informationText.getWidth() / 2
        });

        menuLayer = new Kinetic.Layer();
        menuLayer.name = "gameMenu";
        menuLayer.add(classicGameText);
        menuLayer.add(timeTrialGameText);
        menuLayer.add(scoreBoardText);
        menuLayer.add(informationText);
        stage.add(menuLayer);

        //Event listeners
        var classicGameTextMouseOver = new Kinetic.Animation(function(frame) {
            classicGameText.fill('black');
            this.stop();
        }, menuLayer);

        var classicGameTextMouseOut = new Kinetic.Animation(function(frame) {
            classicGameText.fill('grey');
            this.stop();
        }, menuLayer);

        classicGameText.on("mouseover", function() {
            classicGameTextMouseOver.start();
        });

        classicGameText.on("mouseout", function() {
            classicGameTextMouseOut.start();
        });

        classicGameText.on("click", function() {
            classicDifficultySelectMenu();
        });

        var timeTrialGameTextMouseOver = new Kinetic.Animation(function(frame) {
            timeTrialGameText.fill('black');
            this.stop();
        }, menuLayer);

        var timeTrialGameTextMouseOut = new Kinetic.Animation(function(frame) {
            timeTrialGameText.fill('grey');
            this.stop();
        }, menuLayer);

        timeTrialGameText.on("mouseover", function() {
            timeTrialGameTextMouseOver.start();
        });

        timeTrialGameText.on("mouseout", function() {
            timeTrialGameTextMouseOut.start();
        });

        timeTrialGameText.on("click", function() {
            timeTrialGameMenu();
        });

        var scoreBoardTextMouseOver = new Kinetic.Animation(function(frame) {
            scoreBoardText.fill('black');
            this.stop();
        }, menuLayer);

        var scoreBoardTextMouseOut = new Kinetic.Animation(function(frame) {
            scoreBoardText.fill('grey');
            this.stop();
        }, menuLayer);

        scoreBoardText.on("mouseover", function() {
            scoreBoardTextMouseOver.start();
        });

        scoreBoardText.on("mouseout", function() {
            scoreBoardTextMouseOut.start();
        });

        scoreBoardText.on("click", function() {
            scoreBoardMenu();
        });

        var informationTextMouseOver = new Kinetic.Animation(function(frame) {
            informationText.fill('black');
            this.stop();
        }, menuLayer);

        var informationTextMouseOut = new Kinetic.Animation(function(frame) {
            informationText.fill('grey');
            this.stop();
        }, menuLayer);

        informationText.on("mouseover", function() {
            informationTextMouseOver.start();
        });

        informationText.on("mouseout", function() {
            informationTextMouseOut.start();
        });

        informationText.on("click", function() {
            informationMenu();
        });
    }

    function classicDifficultySelectMenu() {

        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        var easyText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) - 100,
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
            y: (height / 3),
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
            y: (height / 3) + 100,
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
            y: (height / 3) + 200,
            text: 'Back to the menu',
            fontSize: 32,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        backText.setOffset({
            x: backText.getWidth() / 2
        });

        //Layer setup
        difficultyLayer = new Kinetic.Layer();
        difficultyLayer.name = "difficultySelectMenu";
        difficultyLayer.add(easyText);
        difficultyLayer.add(mediumText);
        difficultyLayer.add(hardText);
        difficultyLayer.add(backText);
        stage.add(difficultyLayer);

        //Easy menu
        var easyTextMouseOver = new Kinetic.Animation(function(frame) {
            easyText.fill('black');
            this.stop();
        }, difficultyLayer);

        var easyTextMouseOut = new Kinetic.Animation(function(frame) {
            easyText.fill('grey');
            this.stop();
        }, difficultyLayer);

        easyText.on("mouseover", function() {
            easyTextMouseOver.start();
        });

        easyText.on("mouseout", function() {
            easyTextMouseOut.start();
        });

        easyText.on("click", function() {
            gameDifficulty = "easy";
            startNewClassicGame();
        });

        //Medium menu
        var mediumTextMouseOver = new Kinetic.Animation(function(frame) {
            mediumText.fill('black');
            this.stop();
        }, difficultyLayer);

        var mediumTextMouseOut = new Kinetic.Animation(function(frame) {
            mediumText.fill('grey');
            this.stop();
        }, difficultyLayer);

        mediumText.on("mouseover", function() {
            mediumTextMouseOver.start();
        });

        mediumText.on("mouseout", function() {
            mediumTextMouseOut.start();
        });

        mediumText.on("click", function() {
            gameDifficulty = "medium";
            startNewClassicGame();
        });

        //Hard menu
        var hardTextMouseOver = new Kinetic.Animation(function(frame) {
            hardText.fill('black');
            this.stop();
        }, difficultyLayer);

        var hardTextMouseOut = new Kinetic.Animation(function(frame) {
            hardText.fill('grey');
            this.stop();
        }, difficultyLayer);

        hardText.on("mouseover", function() {
            hardTextMouseOver.start();
        });

        hardText.on("mouseout", function() {
            hardTextMouseOut.start();
        });

        hardText.on("click", function() {
            gameDifficulty = "hard";
            startNewClassicGame();
        });

        //Back menu
        var backTextMouseOver = new Kinetic.Animation(function(frame) {
            backText.fill('black');
            this.stop();
        }, difficultyLayer);

        var backTextMouseOut = new Kinetic.Animation(function(frame) {
            backText.fill('grey');
            this.stop();
        }, difficultyLayer);

        backText.on("mouseover", function() {
            backTextMouseOver.start();
        });

        backText.on("mouseout", function() {
            backTextMouseOut.start();
        });

        backText.on("click", function() {
            mainMenu();
        });
    }

    function timeTrialGameMenu() {

        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        var timeTrialText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3),
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
            y: (height / 3) + 200,
            text: 'Back to the menu',
            fontSize: 32,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        backText.setOffset({
            x: backText.getWidth() / 2
        });

        //Layer setup
        timeTrialGameLayer = new Kinetic.Layer();
        timeTrialGameLayer.name = "timeTrialGameLayer";
        timeTrialGameLayer.add(timeTrialText);
        timeTrialGameLayer.add(backText);
        stage.add(timeTrialGameLayer);

        //Time Trial menu
        var timeTrialTextMouseOver = new Kinetic.Animation(function(frame) {
            timeTrialText.fill('black');
            this.stop();
        }, timeTrialGameLayer);

        var timeTrialTextMouseOut = new Kinetic.Animation(function(frame) {
            timeTrialText.fill('grey');
            this.stop();
        }, timeTrialGameLayer);

        timeTrialText.on("mouseover", function() {
            timeTrialTextMouseOver.start();
        });

        timeTrialText.on("mouseout", function() {
            timeTrialTextMouseOut.start();
        });

        timeTrialText.on("click", function() {
            startNewTimeTrialGame();
        });

        //Back menu
        var backTextMouseOver = new Kinetic.Animation(function(frame) {
            backText.fill('black');
            this.stop();
        }, timeTrialGameLayer);

        var backTextMouseOut = new Kinetic.Animation(function(frame) {
            backText.fill('grey');
            this.stop();
        }, timeTrialGameLayer);

        backText.on("mouseover", function() {
            backTextMouseOver.start();
        });

        backText.on("mouseout", function() {
            backTextMouseOut.start();
        });

        backText.on("click", function() {
            mainMenu();
        });
    }

    function scoreBoardMenu() {
        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        var classicText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) - 100,
            text: 'Classic game',
            fontSize: 32,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        classicText.setOffset({
            x: classicText.getWidth() / 2
        });

        var easyText = new Kinetic.Text({
            x: (width / 2) - 120,
            y: (height / 3) - 40,
            text: 'Easy\n' + (typeof $.cookie('classic_high_score_easy') == 'undefined' ? '99:99' : $.cookie('classic_high_score_easy')),
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        easyText.setOffset({
            x: easyText.getWidth() / 2
        });

        var mediumText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) - 40,
            text: 'Medium\n' + (typeof $.cookie('classic_high_score_medium') == 'undefined' ? '99:99' : $.cookie('classic_high_score_medium')),
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        mediumText.setOffset({
            x: mediumText.getWidth() / 2
        });

        var hardText = new Kinetic.Text({
            x: (width / 2) + 120,
            y: (height / 3) - 40,
            text: 'Hard\n' + (typeof $.cookie('classic_high_score_hard') == 'undefined' ? '99:99' : $.cookie('classic_high_score_hard')),
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        hardText.setOffset({
            x: hardText.getWidth() / 2
        });

        var timeTrialText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) + 40,
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
            y: (height / 3) + 100,
            text: (typeof $.cookie('time_trial_score') == 'undefined' ? '0' : $.cookie('time_trial_score')) + ". szint",
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        levelText.setOffset({
            x: levelText.getWidth() / 2
        });

        var backText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) + 200,
            text: 'Back to the menu',
            fontSize: 32,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        backText.setOffset({
            x: backText.getWidth() / 2
        });

        //Layer setup
        scoreBoardMenuLayer = new Kinetic.Layer();
        scoreBoardMenuLayer.name = "scoreBoardMenuLayer";
        scoreBoardMenuLayer.add(classicText);
        scoreBoardMenuLayer.add(easyText);
        scoreBoardMenuLayer.add(mediumText);
        scoreBoardMenuLayer.add(hardText);
        scoreBoardMenuLayer.add(timeTrialText);
        scoreBoardMenuLayer.add(levelText);
        scoreBoardMenuLayer.add(backText);
        stage.add(scoreBoardMenuLayer);

        //Back menu
        var backTextMouseOver = new Kinetic.Animation(function(frame) {
            backText.fill('black');
            this.stop();
        }, scoreBoardMenuLayer);

        var backTextMouseOut = new Kinetic.Animation(function(frame) {
            backText.fill('grey');
            this.stop();
        }, scoreBoardMenuLayer);

        backText.on("mouseover", function() {
            backTextMouseOver.start();
        });

        backText.on("mouseout", function() {
            backTextMouseOut.start();
        });

        backText.on("click", function() {
            mainMenu();
        });
    }

    function informationMenu() {

        if (stage.hasChildren()) {
            stage.destroyChildren();
        }

        var informationText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) - 100,
            text: '',
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        var infoText = 'Game goal:\nTurn all the pipes into the correct position, so every pipe connected to each other!\n';
        infoText += 'In classic game you can choose between three different difficulty, while in time trial the difficulty is incrementaly increasing.\n';
        infoText += 'Time is key, so don\'t hesitate too much!\n';
        infoText += 'You can check your rank at the scoreboard!\n\nMade by: White Rabbit (Tamás Ruszka) (C) 2014,\nMail: ruszka dot tamas at gmail dot com';

        informationText.setText(infoText);

        informationText.setOffset({
            x: (informationText.getWidth() / 2) > 0 ? (informationText.getWidth() / 2) : 0
        });

        var backText = new Kinetic.Text({
            x: width / 2,
            y: (height / 3) + 200,
            text: 'Back to the menu',
            fontSize: 32,
            fontFamily: 'Calibri',
            fill: 'grey'
        });

        backText.setOffset({
            x: backText.getWidth() / 2
        });

        //Layer setup
        informationMenuLayer = new Kinetic.Layer();
        informationMenuLayer.name = "informationMenuLayer";
        informationMenuLayer.add(informationText);
        informationMenuLayer.add(backText);
        stage.add(informationMenuLayer);

        //Back menu
        var backTextMouseOver = new Kinetic.Animation(function(frame) {
            backText.fill('black');
            this.stop();
        }, informationMenuLayer);

        var backTextMouseOut = new Kinetic.Animation(function(frame) {
            backText.fill('grey');
            this.stop();
        }, informationMenuLayer);

        backText.on("mouseover", function() {
            backTextMouseOver.start();
        });

        backText.on("mouseout", function() {
            backTextMouseOut.start();
        });

        backText.on("click", function() {
            mainMenu();
        });
    }

    function gameTable() {

        var i = 0;
        var j = 0;

        gameLayers = [];
        for (i = 0; i < layerRows; i++) {
            gameLayers[i] = new Array(layerColumns);
            for (j = 0; j < layerColumns; j++) {
                gameLayers[i][j] = new Kinetic.Layer();
            }
        }

        blocks = [];

        this.generateFields = function() {

            var i = 0;
            var j = 0;
            var greater = 0;
            var smaller = 0;

            var generateIt = true;

            for (i = 0; i < rows; i++) {
                blocks[i] = new Array(columns);
                for (j = 0; j < columns; j++) {
                    blocks[i][j] = new block(i, j, i * columns + j);
                }
            }

            while (generateIt) {

                generateIt = false;
                var x = Math.floor((Math.random() * (rows)));
                var y = Math.floor((Math.random() * (columns)));
                if (blocks[x][y].getKey() !== 0) {
                    var direction = Math.floor((Math.random() * 4) + 0);
                    switch (direction) {
                        case 0:
                            if (x !== 0) {
                                //Left
                                if (typeof blocks[x - 1][y] != "undefined") {
                                    if (blocks[x][y].getKey() != blocks[x - 1][y].getKey()) {
                                        blocks[x][y].setLeft(true);
                                        blocks[x - 1][y].setRight(true);
                                        greater = blocks[x][y].getKey() > blocks[x - 1][y].getKey() ? blocks[x][y].getKey() : blocks[x - 1][y].getKey();
                                        smaller = blocks[x][y].getKey() < blocks[x - 1][y].getKey() ? blocks[x][y].getKey() : blocks[x - 1][y].getKey();
                                        for (i = 0; i < rows; i++) {
                                            for (j = 0; j < columns; j++) {
                                                if (blocks[i][j].getKey() == greater) {
                                                    blocks[i][j].setKey(smaller);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        case 1:
                            if (y !== 0) {
                                //Up
                                if (typeof blocks[x][y - 1] != "undefined") {
                                    if (blocks[x][y].getKey() != blocks[x][y - 1].getKey()) {
                                        blocks[x][y].setUp(true);
                                        blocks[x][y - 1].setDown(true);
                                        greater = blocks[x][y].getKey() > blocks[x][y - 1].getKey() ? blocks[x][y].getKey() : blocks[x][y - 1].getKey();
                                        smaller = blocks[x][y].getKey() < blocks[x][y - 1].getKey() ? blocks[x][y].getKey() : blocks[x][y - 1].getKey();
                                        for (i = 0; i < rows; i++) {
                                            for (j = 0; j < columns; j++) {
                                                if (blocks[i][j].getKey() == greater) {
                                                    blocks[i][j].setKey(smaller);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        case 2:
                            if (x != columns - 1) {
                                //Right
                                if (typeof blocks[x + 1][y] != "undefined") {
                                    if (blocks[x][y].getKey() != blocks[x + 1][y].getKey()) {
                                        blocks[x][y].setRight(true);
                                        blocks[x + 1][y].setLeft(true);
                                        greater = blocks[x][y].getKey() > blocks[x + 1][y].getKey() ? blocks[x][y].getKey() : blocks[x + 1][y].getKey();
                                        smaller = blocks[x][y].getKey() < blocks[x + 1][y].getKey() ? blocks[x][y].getKey() : blocks[x + 1][y].getKey();
                                        for (i = 0; i < rows; i++) {
                                            for (j = 0; j < columns; j++) {
                                                if (blocks[i][j].getKey() == greater) {
                                                    blocks[i][j].setKey(smaller);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        case 3:
                            if (y != rows - 1) {
                                //Down
                                if (typeof blocks[x][y + 1] != "undefined") {
                                    if (blocks[x][y].getKey() != blocks[x][y + 1].getKey()) {
                                        blocks[x][y].setDown(true);
                                        blocks[x][y + 1].setUp(true);
                                        greater = blocks[x][y].getKey() > blocks[x][y + 1].getKey() ? blocks[x][y].getKey() : blocks[x][y + 1].getKey();
                                        smaller = blocks[x][y].getKey() < blocks[x][y + 1].getKey() ? blocks[x][y].getKey() : blocks[x][y + 1].getKey();
                                        for (i = 0; i < rows; i++) {
                                            for (j = 0; j < columns; j++) {
                                                if (blocks[i][j].getKey() == greater) {
                                                    blocks[i][j].setKey(smaller);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
                for (i = 0; i < rows; i++) {
                    for (j = 0; j < columns; j++) {
                        if (blocks[i][j].getKey() > 0) {
                            generateIt = true;
                        }
                    }
                }
            }
            blocks[startingPointX][startingPointY].setConnected(true);
            blocks[startingPointX][startingPointY].connectionHandler(true);
        };

        this.shuffle = function() {
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns; j++) {
                    blocks[i][j].shuffleIt();
                }
            }
        };

        this.drawGame = function() {
            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    blocks[i][j].init();
                    gameLayers[Math.floor(i / layerSize)][Math.floor(j / layerSize)].add(blocks[i][j].getBox());
                }
            }
            this.checkPipeConnections();
            for (i = 0; i < layerRows; i++) {
                for (j = 0; j < layerColumns; j++) {
                    stage.add(gameLayers[i][j]);
                }
            }
        };

        this.checkPipeConnections = function() {

            var i = 0;
            var j = 0;

            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    blocks[i][j].setConnected(false);
                    blocks[i][j].connectionHandler(false);
                }
            }
            blocks[startingPointX][startingPointY].setConnected(true);
            blocks[startingPointX][startingPointY].connectionHandler(true);

            //Iterate throught the matrix
            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    //If current element is connecting
                    if (blocks[i][j].getConnected()) {
                        var updated = false;
                        //Left
                        if (i !== 0 && !updated) {
                            if (blocks[i][j].getLeft() && blocks[i - 1][j].getRight()) {
                                if (!blocks[i - 1][j].getConnected()) {
                                    blocks[i - 1][j].setConnected(true);
                                    blocks[i - 1][j].connectionHandler(true);
                                    i = 0;
                                    j = -1;
                                    updated = true;
                                }
                            }
                        }
                        //Right
                        if (i != rows - 1 && !updated) {
                            if (blocks[i][j].getRight() && blocks[i + 1][j].getLeft()) {
                                if (!blocks[i + 1][j].getConnected()) {
                                    blocks[i + 1][j].setConnected(true);
                                    blocks[i + 1][j].connectionHandler(true);
                                    i = 0;
                                    j = -1;
                                    updated = true;
                                }
                            }
                        }
                        //Up
                        if (j !== 0 && !updated) {
                            if (blocks[i][j].getUp() && blocks[i][j - 1].getDown()) {
                                if (!blocks[i][j - 1].getConnected()) {
                                    blocks[i][j - 1].setConnected(true);
                                    blocks[i][j - 1].connectionHandler(true);
                                    i = 0;
                                    j = -1;
                                    updated = true;
                                }
                            }
                        }
                        //Down
                        if (j != columns - 1 && !updated) {
                            if (blocks[i][j].getDown() && blocks[i][j + 1].getUp()) {
                                if (!blocks[i][j + 1].getConnected()) {
                                    blocks[i][j + 1].setConnected(true);
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

    function informationPanel() {

        var x = (width / 2 + (rows * blockSize) / 2) + rows * (space * 2);
        var y = 0;
        var panelWidth = width - (x + (rows * space * 2));
        var panelHeight = height;

        var informationLayer = new Kinetic.Layer();

        var panel = new Kinetic.Group({
            x: x,
            y: y,
            width: panelWidth,
            height: panelHeight
        });

        var timer = new Kinetic.Group({
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

        var level = new Kinetic.Group({
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
            timer.add(timerTitleText);
            timer.add(timerText);
            score.add(scoreTitleText);
            score.add(scoreText);
            score.add(backText);
            level.add(levelTitleText);
            level.add(levelText);
            panel.add(timer);
            panel.add(score);
            panel.add(level);
            informationLayer.add(panel);
            stage.add(informationLayer);
        };

        this.showTimer = function() {
            timer.show();
            informationLayer.draw();
        };

        this.hideTimer = function() {
            timer.hide();
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
            level.show();
            informationLayer.draw();
        };

        this.hideLevel = function() {
            level.hide();
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

        var backTextMouseOver = new Kinetic.Animation(function(frame) {
            backText.fill('black');
            this.stop();
        }, informationLayer);

        var backTextMouseOut = new Kinetic.Animation(function(frame) {
            backText.fill('grey');
            this.stop();
        }, informationLayer);

        backText.on("mouseover", function() {
            backTextMouseOver.start();
        });

        backText.on("mouseout", function() {
            backTextMouseOut.start();
        });

        backText.on("click", function() {
            mainMenu();
        });
    }

    function showBoxStates() {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                console.log(i + ", " + j + ": " + blocks[i][j].getConnected() + " rotation:" + blocks[i][j].getRotation());
            }
        }
    }

    function showDirections() {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                console.log(i + ", " + j + ": (up, left, down, right)" + blocks[i][j].getUp() + blocks[i][j].getLeft() + blocks[i][j].getDown() + blocks[i][j].getRight());
            }
        }
    }

    function showBoxMap() {
        for (var i = 0; i < columns; i++) {
            var out = " ";
            for (var j = 0; j < rows; j++) {
                out += (blocks[j][i].getConnected() ? "O" : "-") + " ";
            }
            console.log(out + i);
        }
        console.log("\n");
    }

    function classicGameFinished() {
        timer.stop();

        setTimeout(function() {

            var newRecord = false;
            if (typeof $.cookie('classic_high_score_' + gameDifficulty) == 'undefined') {
                newRecord = true;
            } else if ($.cookie('classic_high_score_' + gameDifficulty) > timer.getMin() + " : " + timer.getSec()) {
                newRecord = true;
            }

            alert("Congratulation, you solved the level! \nYour time: " + timer.getMin() + " : " + timer.getSec() + (newRecord ? "\nNew record!" : ""));
            if (newRecord) {
                $.cookie('classic_high_score_' + gameDifficulty, timer.getMin() + ' : ' + timer.getSec(), {
                    expires: 365,
                    path: '/'
                });
            }

            mainMenu();

        }, 300);
    }

    function timeTrialGameFinished() {
        timer.stop();

        setTimeout(function() {
            startNewTimeTrialGame();
        }, 300);
    }

    function timeTrialGameTimeUp() {
        timer.stop();

        setTimeout(function() {
            var newRecord = false;
            if (typeof $.cookie('time_trial_score') == 'undefined') {
                newRecord = true;
            } else if ($.cookie('time_trial_score') < level) {
                newRecord = true;
            }

            alert("Congratulation! \nYour level: " + level + (newRecord ? "\nNew record!" : ""));

            if (newRecord) {
                $.cookie('time_trial_score', level, {
                    expires: 365,
                    path: '/'
                });
            }

            mainMenu();

        }, 300);
    }

    function block(row, column, generateKey) {

        //Main attributes
        var x = (row * ((space * 2) + blockSize) + space);
        var y = (column * ((space * 2) + blockSize) + space);
        var up = false;
        var left = false;
        var down = false;
        var right = false;
        var key = generateKey;

        var connected = false;
        var rotation = 0;

        //Shapes

        var box = new Kinetic.Group({
            x: (x + blockSize / 2) + ((width - (blockSize * rows)) / 2) - blockSize / 2,
            y: y + blockSize / 2,
            width: blockSize,
            height: blockSize,
            offset: {
                x: blockSize / 2,
                y: blockSize / 2
            }
        });

        var pipes = new Kinetic.Group({
            x: 0,
            y: 0
        });

        var shape = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: blockSize,
            height: blockSize,
            name: x + '-' + y,
            fill: 'grey',
            stroke: 'black',
            strokeWidth: space
        });

        //getters and setters
        this.getConnected = function() {
            return connected;
        };

        this.setConnected = function(value) {
            connected = value;
        };

        this.getKey = function() {
            return key;
        };

        this.setKey = function(value) {
            key = value;
        };

        this.getRotation = function() {
            return rotation;
        };

        this.setLeft = function(value) {
            left = value;
        };

        this.getLeft = function() {
            return left;
        };

        this.setDown = function(value) {
            down = value;
        };

        this.getDown = function() {
            return down;
        };

        this.setRight = function(value) {
            right = value;
        };

        this.getRight = function() {
            return right;
        };

        this.setUp = function(value) {
            up = value;
        };

        this.getUp = function() {
            return up;
        };

        this.getBox = function() {
            return box;
        };

        this.setParentLayer = function(value) {
            parentLayer = value;
        };

        //Methods
        this.connectionHandler = function(connect) {
            if (connect) {
                pipes.find('.pipeUp').stroke('green');
                pipes.find('.pipeLeft').stroke('green');
                pipes.find('.pipeDown').stroke('green');
                pipes.find('.pipeRight').stroke('green');
            } else {
                pipes.find('.pipeUp').stroke('red');
                pipes.find('.pipeLeft').stroke('red');
                pipes.find('.pipeDown').stroke('red');
                pipes.find('.pipeRight').stroke('red');
            }
        };

        this.shuffleIt = function() {
            for (var k = 0; k < Math.floor((Math.random() * (3)) + 0); k++) {
                if (Math.random() < 0.5) {
                    rotateRight();
                } else {
                    rotateLeft();
                }
            }
        };

        function rotateRight() {
            var temp = up;
            up = left;
            left = down;
            down = right;
            right = temp;
        }

        function rotateLeft() {
            var temp = up;
            up = right;
            right = down;
            down = left;
            left = temp;
        }

        var mouseClick = new Kinetic.Animation(function(frame) {
            animationIsRunning = true;
            box.rotate(5);
            if (box.rotation() >= (rotation + 90)) {
                box.rotation(rotation + 90);
                rotation = box.rotation();

                var finished = true;
                for (i = 0; i < rows; i++) {
                    for (j = 0; j < columns; j++) {
                        if (!blocks[i][j].getConnected()) {
                            finished = false;
                        }
                    }
                }
                this.stop();
                animationIsRunning = false;
                if (finished) {
                    if (gameType == "classic") {
                        classicGameFinished();
                    } else if (gameType == "time-trial") {
                        timeTrialGameFinished();
                    }
                } else {
                    for (i = 0; i < layerRows; i++) {
                        for (j = 0; j < layerColumns; j++) {
                            gameLayers[i][j].draw();
                        }
                    }
                }
            }
        }, gameLayers[Math.floor(row / layerSize)][Math.floor(column / layerSize)]);

        this.init = function() {

            //Pipe graphic definition
            var pipeUp = new Kinetic.Line({
                points: [blockSize / 2, 0, blockSize / 2, blockSize / 2],
                stroke: 'red',
                strokeWidth: 13,
                lineCap: 'round',
                name: 'pipeUp'
            });

            var pipeLeft = new Kinetic.Line({
                points: [0, blockSize / 2, blockSize / 2, blockSize / 2],
                stroke: 'red',
                strokeWidth: 13,
                lineCap: 'round',
                name: 'pipeLeft'
            });

            var pipeDown = new Kinetic.Line({
                points: [blockSize / 2, blockSize, blockSize / 2, blockSize / 2],
                stroke: 'red',
                strokeWidth: 13,
                lineCap: 'round',
                name: 'pipeDown'
            });

            var pipeRight = new Kinetic.Line({
                points: [blockSize, blockSize / 2, blockSize / 2, blockSize / 2],
                stroke: 'red',
                strokeWidth: 13,
                lineCap: 'round',
                name: 'pipeRight'
            });

            //Placing pipes
            if (up) {
                pipes.add(pipeUp);
            }

            if (left) {
                pipes.add(pipeLeft);
            }

            if (down) {
                pipes.add(pipeDown);
            }

            if (right) {
                pipes.add(pipeRight);
            }

            box.on("click", function() {
                if (!mouseClick.isRunning() && !animationIsRunning) {
                    rotateRight();
                    mouseClick.start();
                    setTimeout(function() {
                        table.checkPipeConnections();
                    }, 100);
                }
            });

            box.add(shape);
            box.add(pipes);
        };
    }
})(jQuery);