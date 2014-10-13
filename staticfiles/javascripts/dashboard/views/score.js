define([
    'app',
    'pageview'
], function(App, PageView) {
    
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
    
    App.Pages.Score = new (PageView.extend({
        events: {
            'click .btn-replay': 'replay'
        },
        initPage: function() {
            this.plays = new App.Collections.Plays();
            this.views = {
                score: new ScoreView({
                    el: this.$('.score-list'),
                    collection: this.plays
                })
            };
        },
        replay: function() {
            App.router.navigate('home');
        },
        render: function() {
            App.showShareTip();
            var self = this;
            App.plays.fetch({
                reset: true,
                data: { platform: App.platform },
                success: function(collection) {
                    var today = moment().dayOfYear();
                    var filter = _.chain(collection.toJSON()).filter(function(play) {
                        return moment(play.time_created).dayOfYear() == today
                    }).each(function(play, index) {
                        play.index = index + 1;
                    }).value();
                    self.plays.reset(filter);
                }
            });
        }
    }))({el: $('#view-score')});
    
});
