    //*******************************************************************
    //**  OpenShift, Wild Wild West Shooter
    //**  Author: Grant Shipley @gshipley
    //**  Shootem-up game to teach what openshift resources can be killed
    //*******************************************************************
    var game;
    var sound = true;
    var gunSight;
    var gunshot;
    var currObject;  // This is the sprite in the game representing the current OpenShift Object
    var currGameObject;
    var emitter;
    var gameLoop;
    var index=0;
    var frameObject;
    var line='';
    var yeehaw;
    var explosion;
    var objectText, killFrameText, scoreText, introText;
    var content = [
        " ",
        "The OpenShift Evangelist Team presents",
        " ",
        "A simple beer can and bottle shooter game"
    ];
    var locations = [
        [160, 400, 50, 50],  // left fence 1
        [335, 410, 45, 45],  // left fence 2
        [485, 400, 30, 30],  // left fence 3
        [550, 410, 20, 20],  // left fence 4
        [755, 405, 20, 20],  // right fence 1
        [840, 445, 35, 35],  // right fence 2
        [1065, 465, 50, 50],  // right fence 3
        [590, 720, 45, 45],  // ground close
        [670, 535, 20, 20]    // ground far
    ];
    var backend_path = window.backend_path || '/ws';
    var currentGame = {
      username: 'Player 1', // TODO: Get username from real place
      id: '', 
      score: 0
    }

    // We need to create the game on the server
    $.ajax({
        url: backend_path+'/createGame',
        async: false,
        type: 'GET',
        // TODO: Provide the gameId
//        data: { gameId: currentGame.id },
        success: function(results) {
            console.log("Requested via ajax: " + backend_path+'/createGame');
            currentGame.id = results.id;
            // Now that we have a gameId from the server, we can start the game
            game = new Phaser.Game(1151, 768, Phaser.AUTO, 'openshiftgame', { preload: preload, create: create, update: update, render: render });
        }
    });

    var theme = "beer";

    function preload() {
//        game.load.image('playfield', '/assets/gameplayfield.png');
        game.load.image('playfield', '/assets/gameplayfield-2.jpg');
        game.load.image('gunsight', '/assets/gunsight.png');
        game.load.audio('gunshot', '/assets/gunshot.wav');
        game.load.image('item1', '/assets/' + theme + '/item1.png');
        game.load.image('item2', '/assets/' + theme + '/item2.png');
        game.load.image('item3', '/assets/' + theme + '/item3.png');
        game.load.image('item4', '/assets/' + theme + '/item4.png');
        game.load.audio('yeehaw', '/assets/yeehaw.wav');
        game.load.audio('explosion', '/assets/explosion.wav');
        game.load.image('killframe', '/assets/frame.png');
    }

    var clickHandler = function () {
      gunshot.play();
      // Check if the gunsight is over the currentObject
      
      if(checkOverlap(gunSight, currObject)) {
          // Add the emitter for the explosion and play the yeehaw for target hit
          //game.sound.mute = sound
          explosion.play();
          emitter = game.add.emitter(0, 0, 100);
          // TODO: [JMP] Check that we're providing back the type
          emitter.makeParticles(currGameObject.type.name);
          emitter.gravity = 200;
          //  Position the emitter where the mouse/touch event was
          emitter.x = locations[currLocation][0];
          emitter.y = locations[currLocation][1];
          //  The first parameter sets the effect to "explode" which means all particles are emitted at once
          //  The second gives each particle a 2000ms lifespan
          //  The third is ignored when using burst/explode mode
          //  The final parameter (10) is how many particles will be emitted in this single burst
          emitter.start(true, 2000, null, 10);

          // TODO: [JMP] Send score to the server
          currentGame.score += currGameObject.type.value;

          // delete the object on the game server
          deleteObject(currentGame.id, currGameObject);

          currObject.destroy();
          objectText.text="";
      } else {
          // The player missed the target and should be penalized with a deduction in score
          // TODO: [JMP] Send score to the server
          currentGame.score -= 30;
      }
      displayScore(currentGame.username, currentGame.score);
    };

    function displayScore(user, score) {
      scoreText.text = "User: " + user + "\nScore: " + score;
    }

    function muteSound() {
        game.sound.mute = true;
      }

    function create() {
        // load the playfield background image
        var playfield = game.add.image(game.world.centerX, game.world.centerY, 'playfield');
        playfield.anchor.setTo(0.5, 0.5);

        // Start the physics system for the gunsight and explosion
        game.physics.startSystem(Phaser.Physics.ARCADE);

        introText = game.add.text(32, 660, '', { font: "26pt Courier", fill: "#000000", stroke: "#000000", strokeThickness: 2 });
        scoreText = game.add.text(765, 10, 'User: ' + currentGame.username + '\nScore: 000', { font: "16pt Courier", fill: "#000000", stroke: "#000000", strokeThickness: 2 });
        objectText = game.add.text(32, 670, '', { font: "16pt Courier", fill: "#000000", stroke: "#000000", strokeThickness: 2 });

        displayIntroText();

        gunshot = game.add.audio('gunshot'); // Load the gunshot audio
        yeehaw = game.add.audio('yeehaw'); // Load the gunshot yeehaw
        yeehaw.play();  // Play the intro sound
        explosion = game.add.audio('explosion'); // Set the explosion sound

        // load the gun sights
        gunSight = game.add.sprite(game.world.centerX, game.world.centerY, 'gunsight');
        gunSight.anchor.set(0.5);
        game.physics.arcade.enable(gunSight);
        gunSight.inputEnabled = true;

        // If the player fired their weapon
        gunSight.events.onInputDown.add(clickHandler, this);
    }

    function displayObject() {
        // Get a random location from the location array as defined in the locations array
        currLocation = getRandomLocation(0, locations.length-1);

        // Get a random object from the backend
        getRandomObject();

        // Add the object to the playfiend using the random location
        currObject = game.add.sprite(locations[currLocation][0], locations[currLocation][1], currObject.type.name);
        currObject.height = locations[currLocation][2];
        currObject.width = locations[currLocation][3];

        //delete the openshift object after it has been visible for 3 seconds.
        game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            // Only delete if currGameObject has not been properly shot
            if (currGameObject != null){
              currObject.destroy();
              objectText.text = "";
              // delete the object on the game server
              deleteObject(currentGame.gameId, currGameObject);
            }
        });
        gunSight.bringToTop();
    }

    function displayGameOver() {
      gunSight.events.onInputDown.removeAll();
      stopGameDisplayLoop();

      frameObject = game.add.sprite(220, 153, 'killframe');
      frameObject.inputEnabled = true;

      killFrameText = game.add.text(330, 270, '', { font: "26pt Courier", fill: "#000000", stroke: "#000000", strokeThickness: 2 });
      killFrameText.setText("GAME OVER!!! \nYour score is: " + currentGame.score);
/*
      frameObject.events.onInputDown.add(function() {
          frameObject.destroy();
          killFrameText.destroy();
      }, this);
*/
    }
  
    function getRandomObject() {
        $.ajax({
            url: backend_path+'/getRandomObject',
            async: false,
            type: 'GET',
            data: { gameId: currentGame.id },
            success: function(results) {
              currObject = results;
              currGameObject = results;
              objectText.text = "ID: " + results.id + "\nType: " + results.type.name + "\nScore: " + results.type.value;
            },
            error: function(jqXHR, textStatus, error) {
                //TODO: GAME OVER
                console.log("Error " + textStatus + " getting a random object: " + error);
                displayGameOver();
            }
        });
    }

    function deleteObject() {
        $.ajax({
            url: backend_path+'/deleteObject',
            async: false,
            type: 'GET',
            data: { gameId: currentGame.id, id : currGameObject.id },
            success: function() {
              console.log("Deleted object["+currGameObject.id+"] from gameId["+currentGame.id);
            },
            error: function() {
                console.log("Error deleting object["+currGameObject.id+"] from gameId["+currentGame.id);
            }
        })
        currGameObject = null;
    }

    function checkOverlap(spriteA, spriteB) {
        if(typeof spriteA != 'undefined' && typeof spriteB != 'undefined') {
            var boundsA = spriteA.getBounds();
            var boundsB = spriteB.getBounds();

            return Phaser.Rectangle.intersects(boundsA, boundsB);
        }

    }

    function getRandomLocation(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    function update() {
        //  If the gunsight is > 8px away from the pointer then let's move to it
        if (game.physics.arcade.distanceToPointer(gunSight, game.input.activePointer) > 8) {
            //  Make the object seek to the active pointer (mouse or touch).
            game.physics.arcade.moveToPointer(gunSight, 300, game.input.activePointer, 100);
        }
        else {
            //  Otherwise turn off velocity because we're close enough to the pointer
            gunSight.body.velocity.set(0);
        }
    }

    function updateLine() {
        if (line.length < content[index].length)
        {
            line = content[index].substr(0, line.length + 1);
            // text.text = line;
            introText.setText(line);
        }
        else
        {
            //  Wait 2 seconds then start a new line
            game.time.events.add(Phaser.Timer.SECOND * 1, displayIntroText, this);
        }

    }

    function displayIntroText() {
        index++;
        if (index < content.length)
        {
            line = '';
            game.time.events.repeat(80, content[index].length + 1, updateLine, this);
        } else {
            introText.destroy();
            startGameDisplayLoop();
        }

    }

    function startGameDisplayLoop() {
        gameLoop = game.time.events.loop(Phaser.Timer.SECOND * 3, displayObject, this);
    }

    function stopGameDisplayLoop() {
        game.time.events.remove(gameLoop);
    }

    function render() {
        // If you are working / modifying this code base,
        // uncomment the following line to display helpful information
        // in the top left corner

         game.debug.inputInfo(32, 32);
    }
