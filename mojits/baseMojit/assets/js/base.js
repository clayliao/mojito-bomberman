/*global socket, Crafty, Map, Player, Tile*/

/**
 * Base class. 
 */
function Base(data) {

    // Raw data.
    this._map       = data.map;
    this._players   = data.players;
    this.tileSize   = data.tileSize;

    // Game entities.
    this.map        = {};
    this.players    = {};
    this.playerNum  = 0;
    this.actorId    = '';
    this.bombs      = [];
}

Base.prototype.init = function () {

    var _self = this,
        map, players, isActor, playersNum, k, v;

    _self.actorId = 'p#' + socket.socket.sessionid;

    _self.definePlayer();
    _self.definePlayerMovements();

    map = _self.map = new Map(this._map);

    map._game = _self;
    map.generateWorld();

    players = _self._players;

    for (k in players) {
        if (players.hasOwnProperty(k)) {
            v           = players[k];
            v.tileSize  = _self.tileSize;

            isActor = (_self.actorId === k ? true : false);

            _self.players[k] = new Player(k, v, isActor).create();
            _self.playerNum += 1;
        }
    }
};

Base.prototype.definePlayer = function () {
    
    Crafty.c('Bomber', {

        Bomber: function () {
            
            this.requires('Collision, Grid');
            return this;
        }
    });
};

Base.prototype.definePlayerMovements = function () {

    Crafty.c('Controls', {

        init: function () {

            this.requires('Keyboard, Multiway');
        },
        controls: function (speed) {

            var player  = this._player;

            this.multiway(speed, {W: -90, S: 90, D: 0, A: 180})
                .bind('Moved', player.onMoved)
                .bind('NewDirection', player.onNewDirection)
                .bind('KeyDown', player.onKeyDown);

            return this;
        }
    });
};

Base.prototype.addPlayer = function (data) {

    var _self       = this,
        playerId    = data.id,
        playerData  = {};

    playerData.color    = data.color;
    playerData.location = [data.location.x, data.location.y];
    playerData.tileSize = _self.tileSize;

    _self.players[playerId] = new Player(playerId, playerData, false).create();
};

Base.prototype.allRemovePlayers = function (data) {

    var _self = this,
        i;

    for (i = 0; i < data.length; i++) {
        _self.removePlayer(data[i], true);
    }
};

Base.prototype.removePlayer = function (data, animate) {

    var _self       = this,
        players     = _self.players,
        playerId    = data,
        player;

    player = players[playerId];
    if (!player) {
        return;
    }

    player.die(animate);
    delete players[playerId];
};

Base.prototype.heartbeat = function (data) {

    var _self       = this,
        actorId     = _self.actorId,
        player      = _self.players[actorId],
        pData;

    if (!player) {
        return;
    }
    
    pData = {
        id          : player.id,
        coord       : player.coord,
        dir         : player.direction
    };

    socket.emit('heartbeat', pData, _self.allSyncMovements.bind(_self));
};

Base.prototype.allSyncMovements = function (data) {

    var _self       = this,
        players     = _self.players,
        player, pData, coord, direction, p;

    for (p in data) {
        if (data.hasOwnProperty(p)) {
            player  = players[p];
            pData   = data[p];

            if (player) {
                player.location = pData.location;

                if (!player.isActor) {
                    coord       = pData.coord || player.coord;
                    direction   = pData.direction || player.direction;

                    player.entity.tween({ x: coord.x, y: coord.y }, 3);
                    player.updateDirection(direction);
                }
            }
        }
    }
};

Base.prototype.allInsertBombs = function (data) {

    var _self       = this,
        players     = _self.players,
        bombs       = _self.bombs,
        tileSize    = _self.tileSize,
        location    = data.location,
        bombType    = data.type,
        player      = players[data.playerId],
        b           = new Tile(bombType, location[0] * tileSize, location[1] * tileSize).render();

    b.countdown();

    b.e._location = data.location;
    b.e._player = players[data.playerId];

    bombs.push(b);
};

Base.prototype.allDetonateBombs = function (data) {

    var _self           = this,
        map             = _self.map,
        players         = _self.players,
        bombs           = _self.bombs,
        tileSize        = _self.tileSize,
        location        = data.location,
        radius          = data.radius,
        player          = players[data.playerId],
        stopPropagation = [],
        tiles, t, type, i, j, cfg;

    if (player) {
        player.numBombs -= 1;
    }

    bombs[0].e.destroy();
    bombs.shift();

    // Explode the tile which the bomb is sitting on.
    new Tile(5, location[0] * tileSize, location[1] * tileSize).render();

    // Go through every tile within the explosion radius, starting with the nearest ones.
    for (i = 1; i <= radius; i++) {
        tiles = [
            [location[0], location[1] - i],
            [location[0] + i, location[1]],
            [location[0] - i, location[1]],
            [location[0], location[1] + i]
        ];

        // Go through the tiles within radius i.
        for (j = 0; j < tiles.length; j++) {
        
            // Don't attempt to explode tiles if it has already hit an indestructible object.
            if (stopPropagation.indexOf(j) !== -1) {
                continue;
            }

            cfg     = {};
            t       = tiles[j];
            type    = map.getTileType(t);

            // Don't attempt to explode nonexistent tiles.
            if (type !== false) {

                // An indestructible object has been hit. Don't attempt to explode further tiles in this direction.
                if (type === 1) {
                    stopPropagation.push(j);
                }
                else {
                    switch (j) {
                    case 0:
                        cfg = { d: 'n', w: 16, h: 26 };
                        break;
                    case 1:
                        cfg = { d: 'e', w: 26, h: 16 };
                        break;
                    case 2:
                        cfg = { d: 'w', w: 26, h: 16 };
                        break;
                    case 3:
                        cfg = { d: 's', w: 16, h: 26 };
                        break;
                    }
                
                    // We can explode this tile!
                    new Tile(5, t[0] * tileSize, t[1] * tileSize, cfg).render();
                }
            }
        }
    } 
};

Base.prototype.end = function () {

    socket.emit('disconnect');

    socket.disconnect();
    socket.removeAllListeners();
};
