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
            localStorage.setItem('left-city-to-ad', true);
            location.href = this.city.get('adurl');
        },
        showGuide: function() {
            if (this.$el.hasClass('open')) {
                App.showGuideLayer(4, true);
            } else {
                App.showGuideLayer(3, true);
            }
        },
        openArticle: function() {
            this.$el.toggleClass('open');
            this.showGuide();
        },
        play: function() {
            if (this.$('.btn-play').hasClass('played')) {
                App.router.navigate('home');
            } else {
                App.router.navigate('question/' + this.city.id);
            }
        },
        parsedDesc: function() {
            var description = this.city.get('description');
            var lines = App.Text.toJSON(description);
            var text = '';
            _.each(lines, function(line) {
                if (line[0] == '*') {
                    text += '<p class="subtitle">' + line.slice(1).trim() + '</p>';
                } else {
                    text += '<p>' + line + '</p>';
                }
            });
            return text;
        },
        renderCity: function() {
            this.showGuide();
            this.$('.content').scrollTop(0);
            Amour.loadBgImage(this.$el, this.city.get('image'));
            this.$('.title').html(this.city.get('name'));
            this.$('.content').html(this.parsedDesc());
            var outOfPlay = App.plays.timesToday() >= 5;
            var cityPlayed = _.contains(App.plays.citiesPlayed(), this.city.id);
            this.$('.btn-play').toggleClass('played', cityPlayed || outOfPlay);
            this.$('.btn-play').text(outOfPlay ? '今日五次答题机会已用完' : 
                                    (cityPlayed ? '已答题，换个城市' : '抢答赢免费住宿'));
        },
        render: function() {
            var flag = localStorage.getItem('left-city-to-ad');
            if (flag) {
                localStorage.removeItem('left-city-to-ad');
                this.$el.addClass('open');
            } else {
                this.$el.removeClass('open');
            }
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
