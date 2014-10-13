define([
    'app',
    'pageview'
], function(App, PageView) {
    
    App.Pages.Instruction = new (PageView.extend({
        events: {},
        initPage: function() {},
        render: function() {}
    }))({el: $('#view-instruction')});
    
});
