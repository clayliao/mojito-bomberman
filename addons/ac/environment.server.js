YUI.add('custom-mojito-env-addon', function (Y, NAME) {

    var DEFAULT_PORT = 8886;

    function Env(command, adapter, ac) {
    
        this._ac        = ac;
        this._adapter   = adapter;
    }

    Env.prototype = {

        namespace: 'env',
        
        get: function (key) {

            return process.env[key] || process.env[key.toUpperCase()] || process.env[key.toLowerCase()];
        },

        getHostname: function () {

            var hostname = this._adapter.req.headers.host || process.env.manhattan_context__instance_hostname,
                index;

            if (hostname && hostname.length > 0) {
                index = hostname.indexOf(':');
                if (index >= 0) {
                    hostname = hostname.substring(0, index);
                }
            }

            return hostname;
        },

        getServerURL: function (prefix) {
            
            var port        = this._ac.instance.appConfig.appPort,
                protocol    = prefix || 'http';

            return protocol + '://' + this.getHostname() + (port ? (port === 80 ? '' : ':' + port) : ':' + DEFAULT_PORT);
        },

        getAppName: function () {

            var pwd     = this.get('PWD') || '',
                appName = this._ac.instance.appConfig.staticHandling.appName || pwd.substring(pwd.lastIndexOf('/') + 1);

            return appName;
        }
    }

    Y.mojito.addons.ac.env = Env;

}, '1.0.0', { requires: ['mojito-http-addon'] });
