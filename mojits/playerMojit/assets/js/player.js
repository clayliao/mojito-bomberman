/*globals socket, Crafty*/

/**
 * Player class.
 */
function Player(id, data, isActor) {

    this.entity         = {};
    this.id             = id;

    this.isActor        = isActor;
    this.isDead         = false;

    this.direction      = 'h';
    this.coord          = { x: data.tileSize, y: data.tileSize };
    this.location       = data.location;
    this.color          = data.color;
    this.tileSize       = data.tileSize;

    this.width          = 22;
    this.height         = 18;
    this.speed          = 3;

    this.maxBombs       = 3;
    this.numBombs       = 0;
}

Player.prototype.create = function () {

    var _self   = this,
    
        w       = _self.width,
        h       = _self.height,
        speed   = _self.speed,
        color   = _self.color,
        entity, x, y;

    _self.coord.x = x = _self.location[0] * _self.tileSize;
    _self.coord.y = y = _self.location[1] * _self.tileSize;

    entity = _self.entity = Crafty.e('2D, DOM, HTML, Bomber, Controls, Tween, player')
                                    .Bomber()
                                    .append('<a></a>')
                                    .attr({ w: w, h: h, x: x, y: y, z: 1 })
                                    .draw(10, 10, 10, 10)
                                    .css({ backgroundColor: color })
                                    .bind('TweenEnd', function () {
   
                                        if (_self.isDead) {
                                            _self.destroy();
                                       }
                                    });

    entity._player = _self;

    // Only attach controls to actor.
    if (_self.isActor) {
        entity.controls(speed);
    }

    return _self;
};

Player.prototype.collide = function (e) {

    var _self       = this,
        coord       = _self.coord,
        hit         = e.hit('solid'),
        isHit       = true,
        obj, distX, distY, limitX, limitY;

    if (!hit) {
        return false;
    }

    obj = hit[0].obj;

    // On bomb collision, check the if the player is colliding from within or outside the bomb.
    if (obj.__c.bomb) {
        distX = Math.abs(obj.x - coord.x);
        distY = Math.abs(obj.y - coord.y);

        limitX = (obj.x > coord.x) ? _self.width : _self.width + 3;
        limitY = (obj.y > coord.y) ? _self.height : _self.height + 3;

        if (distX < limitX && distY < limitY) {
            isHit = false;
        }
    }

    return isHit;
};

Player.prototype.onMoved = function (from) {

    var _self       = this,
        player      = _self._player;

    if (player.collide(_self)) {
        _self.attr({ x: from.x, y: from.y });
    }
        
    player.coord = from;
};

Player.prototype.onNewDirection = function (movement) {

    var _self       = this,
        player      = _self._player,
        direction   = '';

    if (movement.y < 0) {
        direction += 'n';
    }
    if (movement.y > 0) {
        direction += 's';
    }
    if (movement.x < 0) {
        direction += 'w';
    }
    if (movement.x > 0) {
        direction += 'e';
    }

    if (!movement.x && !movement.y) {
        direction = 'h';
    }

    player.updateDirection(direction);
};

Player.prototype.onKeyDown = function (e) {

    var _self   = this,
        player  = _self._player;

    if (this.isDown('SPACE')) {
        e.preventDefault();
        player.dropBomb();
    }
};

Player.prototype.updateDirection = function (direction) {

    var _self       = this,
        className   = _self.entity._element.className,
        offset      = className.substr(className.length - 2, 1);

    _self.direction                 = direction;
    _self.entity._element.className = (offset === ' ' ? className.substring(0, className.length - 1) + direction : className + ' ' + direction);
};

Player.prototype.dropBomb = function () {

    var _self       = this,
        location    = _self.location,
        maxBombs    = _self.maxBombs,
        numBombs    = _self.numBombs;

    if (numBombs < maxBombs) {
        _self.numBombs += 1;
        socket.emit('putBomb', { location: _self.location, playerId: _self.id, type: 3 });
    }
};

Player.prototype.die = function (animate) {

    var _self   = this,
        e       = _self.entity;

    if (animate) {
        e._element.className += ' dead';
        e.tween({ alpha: 0.0, y: 0 }, 80);
    }
    else {
        e.destroy();
    }

    _self.isDead = true;
};

Player.prototype.destroy = function () {

    var _self   = this;
    _self.entity.destroy();
};
