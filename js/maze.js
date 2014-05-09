            var MAX_X       = 25;
            var MAX_Y       = 15;
            var X_OFFSET    = 1;
            var Y_OFFSET    = 1;
            var TILE_SIZE   = 30;
            var SHOW_TILES  = 5;
            
            var player;
            var wumpus;
            var end;
            var title;
            var pause;
            var cursors;
            var keyPressed = false;
            var playing = false;
            var up, down, left, right, B, S;
            
            var squareStack = [];
            var crumbStack  = [];
            var mazeGrid    = [[]];
            var fogGrid     = [[]];

            var maze;
            
            $(document).ready(function() {
                $('body').focus();
            });

            function Crumb(x, y, sprite) {
                this.x = x;
                this.y = y;
                this.sprite = sprite;
            }
            
            function Player(x, y, sprite) {
                this.x              = x;
                this.y              = y;
                this.sprite         = sprite;
                this.breadcrumbs    = 10;
                
                this.move = function (x, y, wall) {
                    if (! wall) {
                        this.x = x;
                        this.y = y;
                    
                        this.sprite.x = this.x * TILE_SIZE + X_OFFSET;
                        this.sprite.y = this.y * TILE_SIZE + Y_OFFSET;
                    }
                    
                    keyPressed = false;
                }
                
                this.dropBreadcrumb = function() {
                    if (this.breadcrumbs > 0) {
                        crumbStack.push(new Crumb(this.x, this.y, maze.add.sprite(this.x * TILE_SIZE + X_OFFSET, this.y * TILE_SIZE + Y_OFFSET, 'breadcrumb' + TILE_SIZE)));
                        this.breadcrumbs--;
                    }
                }
            }
            
            function Square(x, y) {
                this.north = 1;
                this.south = 1;
                this.east  = 1;
                this.west  = 1;
                
                this.x     = x;
                this.y     = y;
                
                this.fog   = 1;
            }
            
            function generateMaze(startX, startY) {
                var i, j;
                var x, y;
                var sides = [];
                var square = new Square(startX, startY);
                
                squareStack = [];
                
                if (mazeGrid.length > 0) {
                    for (i = 0; i < MAX_X; i++) {
                        if (mazeGrid[i]) {
                            if (mazeGrid[i].length > 0) {
                                for (j = 0; j < MAX_Y; j++) {
                                    if (mazeGrid[i][j].sprite)
                                        mazeGrid[i][j].sprite.destroy();
                                
                                    if (fogGrid[i][j])
                                        fogGrid[i][j].destroy();
                                }
                            }
                        }
                    }
                }
                
                mazeGrid = [[]];
                fogGrid = [[]];
                
                squareStack.push(square);
                
                for (i = 0; i < MAX_X; i++) {
                    mazeGrid[i] = [];
                    fogGrid[i]  = [];
                    for(j = 0; j < MAX_Y; j++) {
                        mazeGrid[i][j] = 0;
                        fogGrid[i][j]  = 0;
                    }
                }
                
                mazeGrid[square.x][square.y] = square;
                
                var cnt = 0;
                var mazeCount = 0;
                while(squareStack.length > 0 && cnt < 1000) {
                    sides = [];
                    
                    for(i = square.x - 1; i <= square.x + 1; i++) {
                        for (j = square.y - 1; j <= square.y + 1; j++) {
                            x = (i < 0) ? 0 : i;
                            x = (x >= MAX_X) ? MAX_X - 1 : x;
                            y = (y < 0) ? 0 : j;
                            y = (y >= MAX_Y) ? MAX_Y - 1 : y;
                     
                            if (! (x == square.x && y == square.y) &&
                                  (x == square.x || y == square.y) && 
                                  (mazeGrid[x][y] == 0)) {
                                sides.push(new Square(x, y));
                            }
                        }
                    }
                    
                    if (sides.length > 0) {
                        
                        var newSquare = sides[Math.floor(Math.random() * sides.length)];
                        
                        if (newSquare.y < square.y) {
                            square.north = 0;
                            newSquare.south = 0;
                        }
                        
                        if (newSquare.y > square.y) {
                            square.south = 0;
                            newSquare.north = 0;
                        }
                        
                        if (newSquare.x < square.x) {
                            square.west = 0;
                            newSquare.east = 0;
                        }
                        
                        if (newSquare.x > square.x) {
                            square.east = 0;
                            newSquare.west = 0;
                        }
                        
                        squareStack.push(square);
                        mazeGrid[newSquare.x][newSquare.y] = newSquare;
                        square = newSquare;
                        mazeCount++;
                    }
                    else {
                        square = squareStack.pop();
                        square = mazeGrid[square.x][square.y];
                    }

                    cnt++;
                }
                
                for(i = 0; i < MAX_X; i++) {
                    for (j = 0; j < MAX_Y; j++) {
                        s = mazeGrid[i][j];
                        if (s == 0) 
                            s = new Square(i, j);
                                            
                        maze.add.sprite(i * TILE_SIZE + X_OFFSET, i * TILE_SIZE + Y_OFFSET, 'all' + TILE_SIZE);
                        
                        if (s.north && s.south && 
                            s.east  && s.west)
                            maze.add.sprite(i * TILE_SIZE + X_OFFSET, j * TILE_SIZE + Y_OFFSET, 'full' + TILE_SIZE);
                        
                        if (s.north) 
                            maze.add.sprite(i * TILE_SIZE + X_OFFSET, j * TILE_SIZE + Y_OFFSET, 'north' + TILE_SIZE);

                        if (s.south) 
                            maze.add.sprite(i * TILE_SIZE + X_OFFSET, j * TILE_SIZE + Y_OFFSET, 'south' + TILE_SIZE);

                        if (s.east) 
                            maze.add.sprite(i * TILE_SIZE + X_OFFSET, j * TILE_SIZE + Y_OFFSET, 'east' + TILE_SIZE);

                        if (s.west) 
                            maze.add.sprite(i * TILE_SIZE + X_OFFSET, j * TILE_SIZE + Y_OFFSET, 'west' + TILE_SIZE);
                        
                        fogGrid[i][j] = maze.add.sprite(i * TILE_SIZE + X_OFFSET, j * TILE_SIZE + Y_OFFSET, 'fog' + TILE_SIZE);
                    }
                }
                
                for(i = 0; i < MAX_X; i++) {
                    for (j = 0; j < MAX_Y; j++) {
                        fogGrid[i][j].bringToTop();
                    }
                }
            }
            
            maze = new Phaser.Game(SHOW_TILES * TILE_SIZE + (2 * X_OFFSET), SHOW_TILES * TILE_SIZE + (2 * Y_OFFSET), Phaser.AUTO, 'maze',
                                          {preload: preload,
                                            create: create,
                                            update: update});
            
            function preload() {
                maze.load.image('all30', 'assets/30/all.png');
                maze.load.image('full30', 'assets/30/full.png');
                maze.load.image('north30', 'assets/30/north.png');
                maze.load.image('south30', 'assets/30/south.png');
                maze.load.image('east30', 'assets/30/east.png');
                maze.load.image('west30', 'assets/30/west.png');
                
                maze.load.image('player30', 'assets/30/player.png');
                maze.load.image('end30', 'assets/30/end.png');
                
                maze.load.image('fog30', 'assets/30/fog.png');
                maze.load.image('breadcrumb30', 'assets/30/breadcrumb.png');
                
                maze.load.image('all6', 'assets/6/all.png');
                maze.load.image('full6', 'assets/6/full.png');
                maze.load.image('north6', 'assets/6/north.png');
                maze.load.image('south6', 'assets/6/south.png');
                maze.load.image('east6', 'assets/6/east.png');
                maze.load.image('west6', 'assets/6/west.png');
                
                maze.load.image('player6', 'assets/6/player.png');
                maze.load.image('end6', 'assets/6/end.png');
                
                maze.load.image('fog6', 'assets/6/fog.png');
                maze.load.image('breadcrumb6', 'assets/6/breadcrumb.png');
            }
            
            function create() {
                maze.stage.backgroundColor = '#ddddff';
                
                initializeMaze();
                
                up = maze.input.keyboard.addKey(Phaser.Keyboard.UP);
                up.onUp.add(function() { 
                    if (playing) {
                        player.move(player.x, player.y - 1, mazeGrid[player.x][player.y].north); 
                        clearFog();
                    }
                }, this);
                up.onDown.add(function() { keyPressed = true; }, this);
                
                down = maze.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                down.onUp.add(function() { 
                    if (playing) {
                        player.move(player.x, player.y + 1, mazeGrid[player.x][player.y].south); 
                        clearFog();
                    }
                }, this);
                down.onDown.add(function() { keyPressed = true; }, this);

                left = maze.input.keyboard.addKey(Phaser.Keyboard.LEFT);
                left.onUp.add(function() { 
                    if (playing) {
                        player.move(player.x - 1, player.y, mazeGrid[player.x][player.y].west);
                        clearFog();
                    }
                }, this);
                left.onDown.add(function() { keyPressed = true; }, this);

                right = maze.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
                right.onUp.add(function() { 
                    if (playing) {
                        player.move(player.x + 1, player.y, mazeGrid[player.x][player.y].east); 
                        clearFog();
                    }
                }, this);
                right.onDown.add(function() { keyPressed = true; }, this);
                
                B = maze.input.keyboard.addKey(Phaser.Keyboard.B);
                B.onUp.add(function() { 
                    if (playing) {
                        player.dropBreadcrumb(); 
                    }
                }, this);
                
                S = maze.input.keyboard.addKey(Phaser.Keyboard.S);
                S.onUp.add(function() {
                    if (! playing) {
                        hideTitle();
                    }
                }, this);
            }
            
            function update() {
            }
            
            function initializeMaze() {
                maze.world.setBounds(X_OFFSET, Y_OFFSET, MAX_X * TILE_SIZE, MAX_Y * TILE_SIZE);
                
                if (player)
                    player.sprite.destroy();
                
                if (wumpus)
                    wumpus.sprite.destroy();
                
                if (end)
                    end.destroy();
                
                var endX = Math.floor(Math.random() * (MAX_X - 12)) + 12;
                var endY = Math.floor(Math.random() * (MAX_Y -  7)) +  7;

                generateMaze(endX, endY);
            
                startX = Math.floor(Math.random() * (MAX_X - 12)) + 12;
                startY = Math.floor(Math.random() * (MAX_Y -  7)) +  7;
                player = new Player(startX, startY, maze.add.sprite(startX * TILE_SIZE + X_OFFSET, startY * TILE_SIZE + Y_OFFSET, 'player' + TILE_SIZE));
                maze.camera.follow(player.sprite);
                playing = true;

                end = maze.add.sprite(endX * TILE_SIZE + X_OFFSET, endY * TILE_SIZE + Y_OFFSET, 'end' + TILE_SIZE);
                clearFog();            
                player.sprite.bringToTop();
            }
            
            function clearFog() {
                for (var i = 0; i < MAX_X; i++) {
                    for (var j = 0; j < MAX_Y; j++) {
                        fogGrid[i][j].x = i * TILE_SIZE + X_OFFSET;
                        fogGrid[i][j].y = j * TILE_SIZE + Y_OFFSET;
                        fogGrid[i][j].bringToTop();
                        
                        if (Math.abs(player.x - i) <= 1 && Math.abs(player.y - j) <= 1) {
                            fogGrid[i][j].x = 0 - TILE_SIZE;
                            fogGrid[i][j].y = 0 - TILE_SIZE;
                            mazeGrid[i][j].fog = 0;
                        }
                        
                        for (var k = 0; k < crumbStack.length; k++){
                            if (Math.abs(crumbStack[k].x - i) <= 1 && Math.abs(crumbStack[k].y - j) <= 1) {
                                fogGrid[i][j].x = 0 - TILE_SIZE;
                                fogGrid[i][j].y = 0 - TILE_SIZE;
                                mazeGrid[i][j].fog = 0;
                            }
                        }
                    }
                }
            }
            
            function hideTitle() {
                title.destroy();
                playing = true;
            }
            
            function showTitle() {
                title = maze.add.sprite(0, 0, 'title' + TILE_SIZE);
                title.fixedToCamera = true;
                title.bringToTop();
                playing = false;
            }