define([
    'app',
    'pageview'
], function(App, PageView) {
    
    var RankingView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            template: '<div class="col-xs-2">{{index}}</div>' +
                      '<div class="col-xs-6">{{user}}</div>' +
                      '<div class="col-xs-4">{{score}}</div>',
            className: 'row ranking-item'
        })
    });
    
    App.Pages.Ranking = new (PageView.extend({
        events: {},
        initPage: function() {
            this.rankings = new App.Collections.Rankings();
            this.views = {
                ranking: new RankingView({
                    el: this.$('.ranking-list'),
                    collection: this.rankings
                })
            };
        },
        showMyRanking: function() {
            var self = this;
            var myRanking = new App.Collections.Rankings();
            myRanking.fetch({
                data: {
                    platform: App.platform,
                    user: App.user.id
                },
                success: function(collection) {
                    if (collection.length == 0) return;
                    var ranking = collection.at(0);
                    ranking.set('index', parseInt(Math.random() * 900) + 100);
                    self.rankings.add(ranking);
                }
            });
        },
        render: function() {
            var $btn = $('.header-navbar>ul>li[data-target=ranking]');
            $btn.addClass('active').siblings().removeClass('active');
            App.showGuideLayer(8);
            var self = this;
            this.rankings.fetch({
                reset: true,
                data: { platform: App.platform },
                success: function(collection) {
                    collection.each(function(model, index) {
                        model.set('index', index + 1);
                    });
                    if (collection.findWhere({user: '你的成绩'}) == null && App.user.id != null) {
                        self.showMyRanking();
                    }
                }
            });
        }
    }))({el: $('#view-ranking')});
    
});
