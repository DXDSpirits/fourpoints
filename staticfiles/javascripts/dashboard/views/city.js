define(['app'], function(App) {
    
    var citiesPlayed = [];
    
    App.Pages.City = new (Amour.PageView.extend({
        events: {
            'click .left-btn': 'openArticle',
            'click .btn-play': 'play',
            'click .ad > a': 'goToAd'
        },
        initPage: function() {
            this.city = new App.Models.City();
            this.listenTo(this.city, 'change', this.renderCity);
        },
        goToAd: function(e) {
            e.preventDefault && e.preventDefault();
            localStorage.setItem('city-left-from', this.city.id);
            window.open(this.city.get('adurl'), '_blank', 'location=no');
        },
        openArticle: function() {
            this.$('>article').toggleClass('open');
        },
        play: function() {
            if (this.$('.btn-play').hasClass('played')) {
                App.router.goTo('Home');
            } else {
                App.router.goTo('Question', {
                    questions: _.sample(this.city.get('questions'), 5),
                    cityId: this.city.id
                });
            }
        },
        renderCity: function() {
            Amour.loadBgImage(this.$el, this.city.get('image'));
            this.$('.title, .ad>span').html(this.city.get('name'));
            this.$('.content').html(this.city.get('description'));
            var outOfPlay = App.plays.timesToday() >= 5;
            var cityPlayed = _.contains(App.plays.citiesPlayed(), this.city.id);
            this.$('.btn-play').toggleClass('played', cityPlayed || outOfPlay);
            this.$('.btn-play').text(outOfPlay ? '今日五次答题机会已用完' : 
                                    (cityPlayed ? '已答题，换个城市' : '开始答题'));
        },
        render: function() {
            this.$('>article').removeClass('open');
            if (this.options.city) {
                this.city.set(this.options.city)
            } else if (this.options.cityId) {
                this.city.set('id', this.options.cityId);
                this.city.fetch();
            }
            citiesPlayed = App.plays.citiesPlayed();
        }
    }))({el: $('#view-city')});
    
});
