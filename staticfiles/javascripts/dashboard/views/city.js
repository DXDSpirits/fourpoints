define(['app'], function(App) {
    
    App.Pages.City = new (Amour.PageView.extend({
        events: {
            'click .left-btn': 'openArticle',
            'click .btn-play': 'play'
        },
        initPage: function() {
            this.city = new Amour.Models.City();
            this.listenTo(this.city, 'change', this.renderCity);
        },
        openArticle: function() {
            this.$('>article').toggleClass('open');
        },
        play: function() {
            App.router.goTo('Question', {
                questions: _.sample(this.city.get('questions'), 5),
                cityId: this.city.id
            });
        },
        renderCity: function() {
            Amour.loadBgImage(this.$el, this.city.get('image'));
            this.$('.title').html(this.city.get('name'));
            this.$('.content').html(this.city.get('description'));
        },
        render: function() {
            this.$('>article').removeClass('open');
            if (this.options.city) {
                this.city.set(this.options.city)
            } else if (this.options.cityId) {
                this.city.set('id', this.options.cityId);
                this.city.fetch();
            }
        }
    }))({el: $('#view-city')});
    
});
