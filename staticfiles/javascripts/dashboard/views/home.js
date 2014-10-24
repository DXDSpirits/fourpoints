define([
    'app',
    'pageview'
], function(App, PageView) {
    
    var regionId = [1,2,3,4,5];
    
    App.Pages.Home = new (PageView.extend({
        events: {
            'click .hero-layer': 'ready',
            'click .card': 'selectCard',
            'click .btn-go': 'goToRegion'
        },
        initPage: function() {},
        goToRegion: function() {
            var $selected = this.$('.card.selected');
            if ($selected.length) {
                var selectedRegion = +$selected.data('region');
                App.router.navigate('region/' + selectedRegion);
            }
        },
        ready: function() {
            this.$('.hero-layer').addClass('hidden');
            this.$('.wrapper').removeClass('invisible');
            this.$('.merge').removeClass('merge');
        },
        selectCard: function(e) {
            var $card = $(e.currentTarget);
            this.$('.card').removeClass('selected');
            $card.addClass('selected');
            this.$('.btn-go').text('Ready? Go!');
            var region = $card.data('region');
            this.$('.poi-layer').addClass('invisible');
            this.$('.poi-layer[data-region=' + region + ']').removeClass('invisible');
        },
        render: function() {
            var $btn = $('.header-navbar>ul>li[data-target=home]');
            $btn.addClass('active').siblings().removeClass('active');
            this.$('.btn-go').text('开始游戏');
            this.$('.card').removeClass('selected');
            return this;
        }
    }))({el: $('#view-home')});
    
});
