define(['app'], function(App) {
    
    var regionId = [1,2,3,4,5];
    
    App.Pages.Home = new (Amour.PageView.extend({
        events: {
            'click .hero-layer': 'ready',
            'click .card': 'selectCard',
            'click .btn-go': 'goToRegion'
        },
        initPage: function() {},
        goToRegion: function() {
            var selectedRegion = +this.$('.card.selected').data('region');
            App.router.goTo('Region', { region: selectedRegion });
        },
        ready: function() {
            this.$('.hero-layer').addClass('hidden');
            this.$('.merge').removeClass('merge');
        },
        selectCard: function(e) {
            var $card = $(e.currentTarget);
            this.$('.card').removeClass('selected');
            $card.addClass('selected');
            this.$('.btn-go').text('Ready? Go!');
        },
        render: function() {
            this.$('.btn-go').text('开始游戏');
            this.$('.card').removeClass('selected');
            return this;
        }
    }))({el: $('#view-home')});
    
});
