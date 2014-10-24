define([
    'app',
    'pageview'
], function(App, PageView) {
    
    App.Pages.City = new (PageView.extend({
        events: {
            'click .left-btn': 'openArticle',
            'click .btn-play': 'play',
            'click .ad > a': 'goToAd'
        },
        initPage: function() {
            this.city = new App.Models.City();
        },
        goToAd: function(e) {
            e.preventDefault && e.preventDefault();
            localStorage.setItem('city-left-from', this.city.id);
            window.open(this.city.get('adurl'), '_blank', 'location=no');
        },
        openArticle: function() {
            this.$el.toggleClass('open');
        },
        play: function() {
            if (this.$('.btn-play').hasClass('played')) {
                App.router.navigate('home');
            } else {
                App.router.navigate('question/' + this.city.id);
            }
        },
        renderCity: function() {
            this.$('.content').scrollTop(0);
            Amour.loadBgImage(this.$el, this.city.get('image'));
            this.$('.title').html(this.city.get('name'));
            this.$('.content').html(this.city.get('description'));
            var outOfPlay = App.plays.timesToday() >= 5;
            var cityPlayed = _.contains(App.plays.citiesPlayed(), this.city.id);
            this.$('.btn-play').toggleClass('played', cityPlayed || outOfPlay);
            this.$('.btn-play').text(outOfPlay ? '今日五次答题机会已用完' : 
                                    (cityPlayed ? '已答题，换个城市' : '抢答赢免费住宿'));
        },
        render: function() {
            this.$el.removeClass('open');
            if (this.options.city) {
                this.city.set(this.options.city)
                this.renderCity();
            } else if (this.options.cityId) {
                var self = this;
                this.city.set('id', this.options.cityId);
                this.city.fetch({
                    success: function() {
                        self.renderCity();
                    }
                });
            }
        }
    }))({el: $('#view-city')});
    
});
