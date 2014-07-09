define(['app'], function(App) {
    
    var citiesPlayed = [];
    
    var CitiesView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: {
                'click': 'viewCity'
            },
            template: '<h4 class="title">{{name}}</h4>',
            className: function() {
                this.played = this.played || _.contains(citiesPlayed, this.model.id);
                return this.played ? 'img city-item played' : 'img city-item'; 
            },
            attributes: function() {
                return { 'data-bg-src': this.model.get('image') }
            },
            viewCity: function() {
                this.played = this.played || _.contains(citiesPlayed, this.model.id);
                if (this.played) return;
                App.router.goTo('City', {
                    city: this.model.toJSON()
                });
            }
        })
    });
    
    App.Pages.Region = new (Amour.PageView.extend({
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
            var region = this.options.region || 1;
            this.cities.fetch({
                data: { region: region }
            });
            citiesPlayed = App.plays.citiesPlayed();
        }
    }))({el: $('#view-region')});
    
});
