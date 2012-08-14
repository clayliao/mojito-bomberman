/**
 * Tile class.
 */
function Tile(type, x, y, data) {

    this.e      = null;
    this.data   = data || {};

    this.x      = x;
    this.y      = y;
    this.type   = type;
}

Tile.prototype.render = function() {

    var _self = this;

    switch (_self.type) {
        case 1:
            _self.e = new Wall();
            break;
        // case 2: Player
        case 3:
            _self.e = new Bomb();
            break;
        // case 4: Large Bombs
        case 5:
            _self.e = new Explosion();
            break;
    }

    if (!_self.e) {
        return;
    }
    
    return _self.e.render(_self.x, _self.y, _self.data);
};

function Wall() {
    Tile.call(this);
};

Wall.prototype.render = function (x, y) {

    this.x      = x;
    this.y      = y;
    this.type   = 1;
    this.e      = Crafty.e('2D, DOM, solid, wall')
                        .attr({ w: 24, h: 24, x: x, y: y })
                        .draw(10, 10, 10, 10);

    return this;
};

function Bomb() {
    Tile.call(this);

    this._speed     = 12;
};

Bomb.prototype.render = function (x, y) {

    this.x      = x;
    this.y      = y;
    this.type   = 3;
    this.e      = Crafty.e('2D, DOM, solid, bomb')
                        .attr({ alpha: 1.0, w: 24, h: 24, x: x, y: y })
                        .draw(10, 10, 10, 10);

    return this;
};

Bomb.prototype.countdown = function () {

    var _self       = this,
        e           = _self.e,
        speed       = _self._speed,
        r           = 0,
        reverse     = false,
        stopFrame;

    e.bind('EnterFrame', function (o) {

        e._element.style.color = 'rgba(' + r + ', 0, 0, 1)';

        r = (reverse) ? Math.max(0, r - speed) : Math.min(255, r + speed);
        if (r === 0 || r === 255) {
            reverse = !reverse;
        }
    });
};

function Explosion () {
    Tile.call(this);
};

Explosion.prototype.render = function (x, y, data) {

    var d = data.d || 'c',
        w = data.w || 26,
        h = data.h || 26;

    this.x      = x;
    this.y      = y;
    this.type   = 5;
    this.e      = Crafty.e('2D, DOM, Tween, explosion, ' + d)
                        .attr({ alpha: 1.0, w: w, h: h, x: x, y: y })
                        .draw(10, 10, 10, 10)
                        .tween({ alpha: 0.0 }, 50)
                        .bind('TweenEnd', this.destroy);

    return this;
};

Explosion.prototype.destroy = function (e) {

    this.destroy();
};
