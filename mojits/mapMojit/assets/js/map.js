/**
 * Map class.
 */
function Map(data) {
    
    this._game  = null;

    this.seed   = data;

    this.size   = {
        tile        : 24,
        row         : this.seed.length,
        col         : this.seed[0].length
    };

    this.width  = (this.size.col * this.size.tile) + (this.size.col * 2);
    this.height = (this.size.row * this.size.tile) + (this.size.row * 2);
}

Map.prototype.generateWorld = function () {

    var X_OFFSET    = 120,
        Y_OFFSET    = 40,

        _self       = this,

        width       = _self.width,
        height      = _self.height;

    Crafty.init(width, height);

    // Loading screen.
    Crafty.scene('loading', function () {

        Crafty.background('#000');

        Crafty.e('2D, DOM, Text')
                .attr({ w: 100, h: 20, x: width - X_OFFSET, y: height - Y_OFFSET })
                .css({ 'text-align': 'center', 'font-size': '24px' })
                .text('Loading...');

        Crafty.scene('main');
    });

    Crafty.scene('main', function () {

        Crafty.background('#388800');
        _self.populateWorld();
    });

    // Automatically play the loading scene.
    Crafty.scene('loading');
};

Map.prototype.populateWorld = function () {

    var _self   = this,
        game    = _self._game,
        seed    = _self.seed,
        size    = _self.size.tile,
        row, tile, i, j, x, y, entity;

    for (i = 0; i < seed.length; i++) {
        row = seed[i];

        for (j = 0; j < row.length; j++) {
            tile    = row[j];

            x       = (i * size) + (i * 2);
            y       = (j * size) + (j * 2);
            entity  = _self.drawEntity(tile, x, y);

            // Bombs
            if (tile === 3) {
                entity.countdown();
                game.bombs.push(entity); 
            }
        }
    }
};

Map.prototype.drawEntity = function (entity, x, y) {

    return new Tile(entity, x, y).render();
};

Map.prototype.getTileType = function (location) {

    var _self   = this,
        seed    = _self.seed,
        tile;
    
    if (typeof seed[location[0]] === 'undefined' || typeof seed[location[0]][location[1]] === 'undefined') {
        return false;
    }

    return seed[location[0]][location[1]];
};
