define(['app'], function(App) {
    
    var RankingView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            template: '<div class="col-xs-2">{{index}}</div>' +
                      '<div class="col-xs-6">{{user}}</div>' +
                      '<div class="col-xs-4">{{score}}</div>',
            className: 'row ranking-item'
        })
    });
    
    App.Pages.Ranking = new (Amour.PageView.extend({
        events: {
            
        },
        initPage: function() {
            this.rankings = new App.Collections.Rankings();
            this.views = {
                ranking: new RankingView({
                    el: this.$('.ranking-list'),
                    collection: this.rankings
                })
            };
        },
        render: function() {
            this.rankings.fetch({
                reset: true,
                data: {
                    platform: App.platform
                }
            });
        }
    }))({el: $('#view-ranking')});
    
});
