/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('playerMojitModelFoo', function(Y) {

/**
 * The playerMojitModelFoo module.
 *
 * @module playerMojit
 */

    /**
     * Constructor for the playerMojitModelFoo class.
     *
     * @class playerMojitModelFoo
     * @constructor
     */
    Y.mojito.models.playerMojitModelFoo = {

        init: function(config) {
            
            this.config = config;
            
            if(typeof YUI._bombermanData.players === 'undefined') {
                YUI._bombermanData.players = {};
            }
            
        },

        /**
         * Method that will be invoked by the mojit controller to obtain data.
         *
         * @param callback {Function} The callback function to call when the
         *        data has been retrieved.
         */
        getData: function(callback) {
            callback({some:'data'});
        }

    };

}, '0.0.1', {requires: []});
