/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('playerMojit', function(Y, NAME) {

/**
 * The playerMojit module.
 *
 * @module playerMojit
 */

    var map             = YUI._bombermanData.map,
        tiles           = YUI._bombermanData.tiles,
        tileSize        = YUI._bombermanData.tileSize,
        players         = YUI._bombermanData.players,
        resetTileType   = 0, // the type of tile when the player leaves a tile
        player          = {
            'id': 0,
            'color': '#fff',
            'location': { x: 1, y: 1 },
            'direction': 'h'
        };

    /**
     * Constructor for the Controller class.
     *
     * @class Controller
     * @constructor
     */
    Y.mojito.controllers[NAME] = {
        
        init: function(config) {
            this.config = config;
        },

        /**
         * Method corresponding to the 'index' action.
         *
         * @param ac {Object} The ActionContext that provides access
         *        to the Mojito API.
         */
        index: function(ac) {

            ac.assets.addCss('./css/player.css', 'top');
            ac.assets.addJs('./js/player.js', 'top');

            Y.log(NAME + ' done()', 'mojito', 'qeperf');
            ac.done();
            
        },
        
        /**
         * checks if the player can move in the given direction
         **/
        canMove: function(dir) {
            
            var moveY = player.location.y,
                moveX = player.location.x,
                moveTo = [player.location.x, player.location.y];
                
            if (dir === 'w') {
                moveX--; 
            }
            else if (dir === 'e') {
                moveX++;
            }
            else if (dir === 'n') {
                moveY--;
            }
            else if (dir === 's') {
                moveY++;
            }
            
            Y.log('Checking ' + moveX + ', ' + moveY + ' ... ' + (tiles[map[moveX][moveY]].walkable ? '[OK]' : '[BLOCKED]'));
            
            // the player can move, set the new tile as the return value
            if (tiles[map[moveX][moveY]].walkable === true) {
                moveTo = [moveX, moveY];
            }
            
            return moveTo;
            
        },

        /**
         * update player location using their coordinates.
         **/
        updateLocation: function(p, data) {

            var coord = data.coord;

            if (!coord) {
                return;
            }

            p.location[0] = Math.round(coord.x / tileSize);
            p.location[1] = Math.round(coord.y / tileSize);
        },
        
        /**
         * removes a plyer from the game and updates the global map
         **/
        destroy: function() {
            map[player.location.x][player.location.y] = resetTileType;
            delete players[player.id];
            Y.log('==> ' + player.id + ' destroyed \n');
        },
        
        /**
         * check if the player is dead or alive
         */
        isDead: function(p, data) {

            var location    = p.location,
                radius      = data.radius,
                bomb        = data.location,
                isDead      = false;

            // Player is within the x-axis of the blast radius;
            if (Math.abs(location[0] - bomb[0]) <= radius && location[1] === bomb[1]) {
                isDead = this._isWithinBlast(bomb, location, radius, 'x');
            }

            // Player is within the y-axis of the blast radius.
            if (Math.abs(location[1] - bomb[1]) <= radius && location[0] === bomb[0]) {
                isDead = this._isWithinBlast(bomb, location, radius, 'y');
            }

            return isDead;
        },

        /**
         * check if player is within the blast radius
         */
        _isWithinBlast: function(bombPos, playerPos, radius, axis) {
            
            var isWithin = true,
                bp, pp, mp, i, t;

            // Given the axis, get player position and bomb position.
            if (axis === 'x') {
                pp      = playerPos[0];
                bp      = bombPos[0];
            }
            else {
                pp      = playerPos[1];
                bp      = bombPos[1];
            }

            // Is player hiding behind a wall?
            for (i = 0; i < radius; i++) {
                // The tile we are checking against.
                t       = (pp >= bp) ? bp + 1 : bp - 1;
                // This looks complicated, but all it does is making sure that the map tile is defined.
                mp      = (axis === 'x') ? (map[t] ? map[t][bombPos[1]] : null) : (map[bombPos[0]] ? map[bombPos[0]][t] : null);

                // The corresponding map tile should exist. Found a wall. Is the player in front or behind it?
                if (mp && mp === 1 && (Math.abs(bp - pp) > Math.abs(bp - t))) {
                    isWithin = false;
                    break;
                }
            }

            return isWithin;
        },
        
        /**
         * this players id
         **/
        getId: function(id) {
            return player.id;
        },
        
        /**
         * returns info such as player id, color, tile etc...
         **/
        getPlayerInfo: function() {
            return player;
        },
        
        /**
         * tries to place a new bomb on the map tile
         **/
        putBomb: function(data) {
            
            var tile = tiles[map[data.location[0]][data.location[1]]],
                type = data.type;

            // Can only put a bomb on a walkable tile
            if (!tile.walkable) {
                return false;
            }

            // Set bomb radius
            data.radius = tiles[type].radius;

            this.updateTile(data.location[0], data.location[1], data.type);
            return data;
        },

        /**
         * removes bomb from map
         */ 
        removeBomb: function(data) {

            this.updateTile(data.location[0], data.location[1], resetTileType);
            return data;
        },
        
        /**
         * sets the unique player id
         **/
        setId: function(id) {
            player.id = 'p#' + id;
            players[player.id] = {};
            Y.log('==> New Player ID: ' + player.id + '\n');
        },
        
        /**
         * sets the players location in the game
         **/
        setLocation: function(x, y) {
            
            // reset the tile that the player is leaving
            map[player.location.x][player.location.y] = resetTileType;
            
            // update player location
            player.location.x = x;
            player.location.y = y;
            
            // update the global map instance that the new tile is empty, as the player is standing on it, so it is walkable
            this.updateTile(x, y, 2);
            
            // update the global players list with the new location
            players[player.id].location = [x, y];
            
            Y.log('==> New Player Location: ' + x + ', ' + y + '\n');
            
        },
        
        /**
         * Determines this players color on the map
         **/
        setColor: function() {
            players[player.id].color = player.color = '#' + ('00000' + (Math.random() * (1<<24) | 0).toString(16)).slice(-6);
            Y.log('==> New Player Color: ' + player.color + '\n');
        },
        
        /**
         * updates the tile type on a given x/y.
         * TODO: should this not be on the mapMojit ?
         **/
        updateTile: function(x, y, type) {
            try {
                map[x][y] = type;
            }
            catch (e) {
                Y.log('ERROR: ' + player.id + ' trying to set [' + x + ', ' + y +'] is out of bounds ...' );
            }
        }

    };

}, '0.0.1', {requires: ['mojito']});
