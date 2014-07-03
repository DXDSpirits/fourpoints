define(['app'], function(App) {
    
    var CitiesView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: {
                'click': 'viewCity'
            },
            template: '<h4 class="title">{{name}}</h4>',
            className: 'img city-item',
            attributes: function() {
                return {
                    'data-bg-src': this.model.get('image')
                }
            },
            viewCity: function() {
                App.router.goTo('City', {
                    city: this.model.toJSON()
                });
            }
        })
    });
    
    App.Pages.Region = new (Amour.PageView.extend({
        events: {},
        initPage: function() {
            this.cities = new Amour.Collections.Cities();
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
            })
        }
    }))({el: $('#view-region')});
    
});