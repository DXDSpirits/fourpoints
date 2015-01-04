define([
    'app',
    'pageview'
], function(App, PageView) {
    
    var verifyCode = new Amour.Model();
    
    var ScoreView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            template: '<div class="col-xs-2">{{index}}</div>' +
                      '<div class="col-xs-3">{{formatted_time}}</div>' +
                      '<div class="col-xs-3">{{solved}}</div>' +
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
            'click .btn-send': 'getcode',
            'click .btn-verify': 'verify',
            'click .btn-cancel': 'cancelLogin',
            'click .btn-replay': 'replay',
            'click .btn-share': 'share'
        },
        initPage: function() {
            _.bindAll(this, 'signin', 'refreshScore', 'renderScoreList');
            this.plays = new App.Collections.Plays();
            this.views = {
                score: new ScoreView({
                    el: this.$('.score-list'),
                    collection: this.plays
                })
            };
        },
        signin: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            if (mobile) {
                App.user.login({
                    username : mobile,
                    password : mobile
                }, {
                    //success : function() {}, login event will trigger active page refresh 
                    error : function() {
                        alert('登录失败');
                    }
                });
            }
        },
        verify: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            var code = +this.$('input[name=code]').val();
            if (mobile && code) {
                verifyCode.set({ mobile: mobile, code: code });
                Backbone.sync('update', verifyCode, {
                    url: Amour.APIHost + '/users/code/',
                    success: this.signin,
                    error: function() {
                        alert('验证码错误');
                    }
                });
            } else {
                this.signin();
            }
        },
        getcode: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            if (mobile) {
                var $btn = $('.btn-send');
                $btn.html('<i class="fa fa-refresh fa-spin"></i>');
                verifyCode.set({ mobile: mobile });
                Backbone.sync('create', verifyCode, {
                    url: Amour.APIHost + '/users/code/',
                    success: function() {
                        $btn.addClass('disabled').text('已发送验证码');
                    }
                });
            }
        },
        cancelLogin: function() {
            this.$('.btn-send').removeClass('disabled').text('发送验证码');
            this.$('.login-box').addClass('hidden');
        },
        replay: function() {
            App.router.navigate('home');
        },
        share: function() {
            if (Amour.isWeixin) {
                App.showGuideLayer(7);
            } else {
                App.shareToWeibo();
            }
        },
        refreshScore: function() {
            App.plays.fetch({
                reset: true,
                data: { platform: App.platform },
                success: this.renderScoreList
            });
        },
        renderScoreList: function() {
            var today = moment().dayOfYear();
            var total_score = 0, total_time = 0;
            var filter = _.chain(App.plays.toJSON()).filter(function(play) {
                return moment(play.time_created).dayOfYear() == today;
            }).each(function(play, index) {
                play.index = index + 1;
                total_score += play.score;
                total_time += play.time;
            }).value();
            this.plays.reset(filter);
            this.$('.summary-total-score').text(total_score);
            var time_str = parseInt(total_time / 60) + '\'' + parseInt(total_time % 60);
            this.$('.summary-total-time').text(time_str);
        },
        render: function() {
            this.$('.btn-send').removeClass('disabled').text('发送验证码');
            var logged_in = (Amour.TokenAuth.get() != null);
            if (logged_in) {
                this.$('.login-box').addClass('hidden');
                var newPlayId = localStorage.getItem('new-play-id');
                if (newPlayId == null) {
                    this.refreshScore();
                } else {
                    localStorage.removeItem('new-play-id');
                    var play = new App.Models.Play({id: newPlayId});
                    play.save({}, {
                        url: play.url() + 'belong/',
                        success: this.refreshScore
                    });
                }
            } else {
                this.$('.login-box').removeClass('hidden');
                App.showGuideLayer(6, true);
            }
        }
    }))({el: $('#view-score')});
    
});
