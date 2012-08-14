/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('tileMojitModelFoo', function(Y) {

/**
 * The tileMojitModelFoo module.
 *
 * @module tileMojit
 */

    /**
     * Constructor for the tileMojitModelFoo class.
     *
     * @class tileMojitModelFoo
     * @constructor
     */
    Y.mojito.models.tileMojitModelFoo = {

        init: function(config) {
            this.config = config;
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
