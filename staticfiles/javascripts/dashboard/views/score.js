define(['app'], function(App) {
    
    var ScoreView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            template: '<div class="col-xs-2">{{index}}</div>' +
                      '<div class="col-xs-2">{{solved}}</div>' +
                      '<div class="col-xs-4">{{formatted_time}}</div>' +
                      '<div class="col-xs-4">{{score}}</div>',
            className: 'row score-item',
            templateHelpers: {
                formatted_time: function() {
                    var time = parseInt((+this.time) * 10) / 10;
                    return time + (time == parseInt(time) ? '.0' : '');
                }
            }
        })
    });
    
    App.Pages.Score = new (Amour.PageView.extend({
        events: {
            
        },
        initPage: function() {
            this.plays = App.plays;
            this.views = {
                score: new ScoreView({
                    el: this.$('.score-list'),
                    collection: this.plays
                })
            };
        },
        render: function() {
            this.plays.fetch({
                reset: true,
                data: {
                    platform: App.isWeixin ? 'weixin' : 'weibo'
                }
            });
        }
    }))({el: $('#view-score')});
    
});
