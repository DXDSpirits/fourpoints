define([
    'app',
    'pageview'
], function(App, PageView) {
    
    App.Pages.Instruction = new (PageView.extend({
        events: {},
        initPage: function() {},
        render: function() {
            var $btn = $('.header-navbar>ul>li[data-target=instruction]');
            $btn.addClass('active').siblings().removeClass('active');
        }
    }))({el: $('#view-instruction')});
    
});
