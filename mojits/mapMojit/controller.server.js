/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('mapMojit', function(Y, NAME) {

/**
 * The mapMojit module.
 *
 * @module mapMojit
 */

    var map,
        tiles;

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
            
            ac.assets.addCss('./css/map.css', 'top');
            ac.assets.addJs('./js/map.js', 'top');
            
            ac.composite.done({
                'mojitName': NAME   
            });
            
            Y.log(NAME + ' done()', 'mojito', 'qeperf');
        },
        
        /**
         * randomly chooses a tile from the current map that is walkable
         **/
        findEmptyTile: function() {
            
            map = map || YUI._bombermanData.map;
            tiles = tiles || YUI._bombermanData.tiles;
            
            var width       = map[0].length,
                height      = map.length,
                randX       = 1,
                randY       = 1,
                randTile;
                
            while (typeof randTile === 'undefined') {
                if (tiles[map[randX][randY]].walkable === true && tiles[map[randX][randY]].name !== 'player') {
                    randTile = {x: randX, y: randY};
                }
                else {
                    randX = Math.floor(Math.random() * width);
                    randY = Math.floor(Math.random() * height);
                }
            }
            
            return randTile;
            
        }

    };

}, '0.0.1', {requires: ['mojito']});
