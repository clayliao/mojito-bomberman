/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('tileMojit', function(Y, NAME) {

/**
 * The tileMojit module.
 *
 * @module tileMojit
 */

    var tiles = {};
    
    tiles[0] = {
        'walkable'  : true,
        'name'      : 'empty'
    };
    
    tiles[1] = {
        'walkable'  : false,
        'name'      : 'wall'
    };
    
    tiles[2] = {
        'walkable'  : true,
        'name'      : 'player'
    };
    
    tiles[3] = {
        'walkable'  : false,
        'name'      : 'smallBomb',
        'radius'    : 3
    };
    
    tiles[4] = {
        'walkable'  : false,
        'name'      : 'largeBomb',
        'radius'    : 6
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

            ac.assets.addCss('./css/tile.css', 'top');
            ac.assets.addJs('./js/tile.js', 'top');
            
            YUI._bombermanData.tiles = tiles;
            
            ac.done();
            Y.log(NAME + ' done()', 'mojito', 'qeperf');
            
        }

    };

}, '0.0.1', {requires: ['mojito']});
