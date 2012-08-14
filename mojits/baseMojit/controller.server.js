/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
YUI.add('baseMojit', function(Y, NAME) {

/**
 * The baseMojit module.
 *
 * @module baseMojit
 */

    var io,
        sio;

    // -- Private Methods ------------------------------------------------------

    /**
     * Generates a single HTML fragment for all assets in the list. An asset is
     * either a URL or an HTML fragment.
     *
     * @method renderListAsHtmlAssets
     * @param {Array} list List of assets.
     * @param {String} type Asset type: 'js', 'css', or 'blob'.
     * @return {String} HTML fragment.
     * @private
     */
    function renderListAsHtmlAssets(list, type) {
        var result   = [],
            template = {
                blob: '{item}',
                css : '<link rel="stylesheet" type="text/css" href="{item}" />',
                js  : '<script type="text/javascript" src="{item}"></script>'
            }[type]; // Auto-select the proper template.

        if (template) {
            Y.Array.each(list, function (item) {
                result.push(template.replace('{item}', item));
            });
        } else {
            Y.log('Skipped unknown asset type "' + type + '".', 'warn', NAME);
        }

        return result.join(result.length > 1 ? '\n' : '');
    }
    
    /**
     * socketConnected()
     * Acts as an event dispatcher
     * Handles stuff every socket connection needs
     * Each instance gets their own socket.
     **/
    function socketConnected(socket) {
            
        Y.log('Socket Connected ...');
        
        // each socket gets to refer to its own mojit instances
        var mapMojit, playerMojit;
        
        // register internal events
        // Y.publish('playersMoved');
        Y.publish('playerJoined');
                
        ////////////////////////
        // internal listeners //
        ////////////////////////
        
        // notifies all instances a new player joins the game
        Y.on('playerJoined', function(data) {

            // dont send to self, send to others
            if ('p#' + socket.id !== data.id) {
                Y.log('p#' + socket.id + ' saw ' + data.id + ' joined the game ... \n');
                // send to client
                socket.emit('playerJoined', data);
            }
            
        });
        
        // notifies all instances which players dies.
        Y.on('playersDied', function(data) {

            Y.log('Deathtoll: ' + data.toString() + ' ... \n');

            socket.emit('playersDied', data);
        });
        
        Y.on('newBomb', function(data) {

            Y.log('p#' + socket.id + ' placed a new bomb ... \n');
            
            // send to client
            socket.emit('bombAdded', data);
            
        });

        Y.on('bombRemoved', function(data) {

            Y.log('Bomb at [' + data.location[0] + ', ' + data.location[1] + '] was removed ... \n');

            // send to client
            socket.emit('bombExploded', data);
        });

        //////////////////////
        // socket listeners //
        //////////////////////
            
        // map
        YUI().use('mapMojit', function(_Y) {
            mapMojit = _Y.mojito.controllers.mapMojit;
        });
        
        // player
        YUI().use('playerMojit', function(_Y) {
            
            playerMojit = _Y.mojito.controllers.playerMojit;

            socket.on('heartbeat', function (data, fn) {

                var players = YUI._bombermanData.players,
                    player  = players[data.id];

                if (player) {
                    player.coord        = data.coord;
                    player.direction    = data.dir;

                    playerMojit.updateLocation(player, data);
                    fn(players);
                }
            });
            
            // place a new bomb on the map
            socket.on('putBomb', function (data, fn) {
                
                var responseData = playerMojit.putBomb(data);
                if (!responseData) {
                    return;
                }

                Y.fire('newBomb', responseData);

                setTimeout(function () {

                    var players     = YUI._bombermanData.players,
                        deathToll   = [],
                        p;

                    for (p in players) {
                        if (players.hasOwnProperty(p) && playerMojit.isDead(players[p], data)) {
                            deathToll.push(p);
                        }
                    }

                    if (deathToll.length > 0) {
                        Y.fire('playersDied', deathToll);
                    }

                    playerMojit.removeBomb(responseData);
                    Y.fire('bombRemoved', responseData);

                }, 3000);
            
            });

            socket.on('disconnect', function (data) {
                
                Y.log('p#' + socket.id + ' disconnected ...');
                
                // remove player from game instance
                playerMojit.destroy();
                
                // tell other players about it
                socket.broadcast.emit('playerDisconnect', 'p#' + socket.id);
                socket.removeAllListeners('connect');
            });

        });
        
        ///////////////////////////////////////////
        // do init stuff that every socket needs //
        ///////////////////////////////////////////
        
        Y.log('Setting Player ID ...');
        playerMojit.setId(socket.id);
        
        Y.log('Setting Player Color ...');
        playerMojit.setColor();
        
        Y.log('Setting Player Location ...');
        var emptyTile = mapMojit.findEmptyTile();
        playerMojit.setLocation(emptyTile.x, emptyTile.y);
        
        Y.log('Sending Init Map ...');

        socket.emit('mapInit', {
            map         : YUI._bombermanData.map,
            players     : YUI._bombermanData.players,
            tileSize    : YUI._bombermanData.tileSize
        });

        Y.log('==> Init Map Sent \n');
        
        // notify other players this player joined
        Y.fire('playerJoined', playerMojit.getPlayerInfo());
    }

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
         * @param ac {Object} The ActionContext that provides access to the Mojito API.
         */
        index: function(ac) {
            
            var that = this;
            
            //////////////////////
            // set up socket.io //
            //////////////////////
            
            // this only gets set once per game (ie. the first player)
            if (typeof YUI._bombermanData.map === 'undefined') {
                
                io = require('socket.io'),
                sio = io.listen(ac.http.getRequest().app);
                
                sio.set('log level', 1);
                
                sio.sockets.on('connection', function (socket) {
                    socketConnected(socket);
                });
                
                setInterval(function() {
                    sio.sockets.emit('heartbeat');
                }, 60); 
            }
            
            ////////////////////////////////////////////////////
            // create a config object for the composite addon //
            ////////////////////////////////////////////////////
            
            var child = ac.config.get('child'),
                config = {
                    view: 'index',
                    assets: ac.config.get('assets'),
                    children: child
                }
            
            //////////////////////////////////////////
            // now execute the child as a composite //
            //////////////////////////////////////////
            
            Y.log('executing ' + NAME + ' child', 'mojito', 'qeperf');
            
            ac.composite.execute(config, function (data, meta) {
                
                //////////////////
                // translations //
                //////////////////
                
                data.translations = {
                    'appName': 'Bomberman'   
                }
                
                /////////////////////////////////
                // app settings needed by view //
                /////////////////////////////////
                
                data.settings = {
                    socketio_url: 'ws://' + ac.env.getHostname(),
                    app_name    : ac.env.getAppName()
                }
                
                //////////////////////
                // baseMojit assets //
                //////////////////////
                
                ac.assets.addBlob('<link rel="icon" href="/static/' + data.settings.app_name + '/assets/favicon.ico" type="image/x-icon"/>', 'top');

                ac.assets.addCss('/static/baseMojit/assets/css/reset.css', 'top');
                ac.assets.addCss('/static/baseMojit/assets/css/base.css', 'top');

                ac.assets.addJs('/socket.io/socket.io.js', 'bottom');
                ac.assets.addJs('/static/' + data.settings.app_name + '/assets/js/crafty/crafty-release.js', 'bottom');
                ac.assets.addJs('/static/baseMojit/assets/js/base.js', 'top');
                
                // add all the assets we have been given to from children to our local store
                ac.assets.addAssets(meta.assets);
                
                // attach assets found in the "meta" to the page
                Y.Object.each(ac.assets.getAssets(), function (types, location) {
                    if (!data[location]) {
                        data[location] = '';
                    }
                    Y.Object.each(types, function (assets, type) {
                        data[location] += renderListAsHtmlAssets(assets, type);
                    });
                });
                
                Y.log(NAME + ' done()', 'mojito', 'qeperf');
                
                // start firing of our childrens index(), then let the execution bubble back up to here
                ac.done(data, meta);
                
            });
            
        }

    };

}, '0.0.1', {requires: [
    'mojito',
    'mojito-assets-addon',
    'mojito-config-addon',
    'mojito-deploy-addon',
    'custom-mojito-env-addon',
    'event-custom'
]});
