/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */

YUI.add('mapMojitModel-tests', function(Y) {
    
    var suite = new YUITest.TestSuite('mapMojitModel-tests'),
        model = null,
        A = YUITest.Assert;
    
    suite.add(new YUITest.TestCase({
        
        name: 'mapMojit model user tests',
        
        setUp: function() {
            model = Y.mojito.models.mapMojitModelFoo;
        },
        tearDown: function() {
            model = null;
        },
        
        'test mojit model': function() {
            A.isNotNull(model);
            A.isFunction(model.getData);
        }
        
    }));
    
    YUITest.TestRunner.add(suite);
    
}, '0.0.1', {requires: ['mojito-test', 'mapMojitModelFoo']});
