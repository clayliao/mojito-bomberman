/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('baseMojitModelFoo', function(Y) {

/**
 * The baseMojitModelFoo module.
 *
 * @module baseMojit
 */

    /**
     * Constructor for the baseMojitModelFoo class.
     *
     * @class baseMojitModelFoo
     * @constructor
     */
    Y.mojito.models.baseMojitModelFoo = {

        init: function(config) {
            
            this.config = config;
            
            // create a new persistent object if not exist yet, meaning this must be the first player
            if(typeof YUI._bombermanData === 'undefined') {
                YUI._bombermanData = {};
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
