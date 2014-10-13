define([
    'app',
    'pageview'
], function(App, PageView) {
    
    var CitiesView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: {
                'click': 'viewCity'
            },
            template: '<h4 class="title">{{name}}</h4>',
            className: 'img city-item',
            attributes: function() {
                return { 'data-bg-src': this.model.get('image') }
            },
            viewCity: function() {
                App.router.navigate('city/' + this.model.id);
            }
        })
    });
    
    App.Pages.Region = new (PageView.extend({
        events: {},
        initPage: function() {
            this.cities = new App.Collections.Cities();
            this.views = {
                cities: new CitiesView({
                    collection: this.cities,
                    el: this.$('.city-list')
                })
            }
        },
        render: function() {
            this.$el.scrollTop(0);
            var regionId = this.options.regionId || 1;
            this.cities.fetch({
                data: { region: regionId }
            });
        }
    }))({el: $('#view-region')});
    
});
