define(['app'], function(App) {
    
    var regionId = [1,2,3,4,5];
    
    App.Pages.Home = new (Amour.PageView.extend({
        events: {
            'click .btn-send': 'getcode',
            'click .btn-verify': 'verify',
            'click .play-box': 'play'
        },
        initPage: function() {
            Amour.ajax.on('unauthorized', this.go);
        },
        signin: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            if (mobile) {
                App.user.login({
                    username : mobile,
                    password : mobile
                }, {
                    success : function() {
                        App.router.refreshActivePage();
                    },
                    error : function() {
                        alert('Login failed');
                    }
                });
            }
        },
        verify: function() {
            var code = this.$('input[name=code]').val() || null;
            var self = this;
            if (code) {
                App.user.verify(code, {
                    success: function() {
                        self.signin();
                    },
                    error: function() {
                        alert('Invalid Code');
                    }
                });
            } else {
                this.signin();
            }
        },
        getcode: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            if (mobile) {
                App.user.set('username', mobile);
                App.user.save();
            }
        },
        stop: function() {
            this.$('.hand').addClass('stop');
            var left = this.$('.ball').offset().left;
            var it = parseInt(left / this.$el.width() * 5);
            this.$('.card'+(it+1)).addClass('selected');
            setTimeout(function() {
                App.router.goTo('Region', {
                    region: regionId[it]
                });
            }, 500);
        },
        play: function() {
            this.$('.card').removeClass('selected');
            this.$('.hand').removeClass('stop').addClass('automatically');
            var self = this;
            setTimeout(function() {
                self.stop();
            }, 4000 + Math.random() * 1000);
        },
        render: function() {
            this.$('.merge').removeClass('merge');
            this.$('input').val('');
            var logged_in = (Amour.TokenAuth.get() != null);
            this.$('.login-box').toggleClass('hidden', logged_in);
            this.$('.play-box').toggleClass('hidden', !logged_in);
            return this;
        }
    }))({el: $('#view-home')});
    
});
