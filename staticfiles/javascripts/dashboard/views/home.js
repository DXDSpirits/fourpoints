define(['app'], function(App) {
    
    var regionId = [1,2,3,4,5];
    
    App.Pages.Home = new (Amour.PageView.extend({
        events: {
            'click .btn-send': 'getcode',
            'click .btn-verify': 'verify',
            'click .play-box.initial': 'ready',
            'click .play-box.ready': 'play',
            'click .btn-select-region': 'selectRegion'
        },
        initPage: function() {
            Amour.ajax.on('unauthorized', this.go);
            _.bindAll(this, 'signin', 'ready', 'play', 'stop');
        },
        signin: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            if (mobile) {
                App.user.login({
                    username : mobile,
                    password : mobile
                }, {
                    success : this.ready,
                    error : function() {
                        alert('登录失败');
                    }
                });
            }
        },
        verify: function() {
            var code = this.$('input[name=code]').val() || null;
            if (code) {
                App.user.verify(code, {
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
                App.user.save({
                    username: mobile
                }, {
                    success: function() {
                        $btn.addClass('disabled').text('已发送验证码');
                    }
                });
            }
        },
        selectRegion: function() {
            var left = this.$('.ball').offset().left;
            var it = parseInt(left / this.$el.width() * 5);
            App.router.goTo('Region', {
                region: regionId[it]
            });
        },
        stop: function() {
            this.playing = false;
            this.$('.btn-select-region').removeClass('hidden');
            this.$('.hand').addClass('stop');
            var left = this.$('.ball').offset().left;
            var it = parseInt(left / this.$el.width() * 5);
            this.$('.card'+(it+1)).addClass('selected');
        },
        play: function() {
            if (this.playing) return;
            this.playing = true;
            this.$('.btn-select-region').addClass('hidden');
            this.$('.card').removeClass('selected');
            this.$('.hand').removeClass('stop').addClass('automatically');
            var self = this;
            setTimeout(this.stop, 4000 + Math.random() * 1000);
        },
        ready: function() {
            this.$('.btn-send').removeClass('disabled').text('发送验证码');
            this.$('.play-box.initial').addClass('hidden');
            var logged_in = (Amour.TokenAuth.get() != null);
            this.$('.login-box').toggleClass('hidden', logged_in);
            this.$('.play-box.ready').toggleClass('hidden', !logged_in);
        },
        render: function() {
            this.$('.btn-select-region').addClass('hidden');
            this.$('.merge').removeClass('merge');
            this.$('input').val('');
            return this;
        }
    }))({el: $('#view-home')});
    
});
