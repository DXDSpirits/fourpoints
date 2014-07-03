define(['app'], function(App) {
    
    var user = new Amour.Models.User();
    
    App.Pages.Home = new (Amour.PageView.extend({
        events: {
            'click .btn-send': 'getcode',
            'click .btn-verify': 'verify'
        },
        initPage: function() {},
        signin: function() {
            var mobile = this.$('input[name=mobile]').val() || null;
            if (mobile) {
                user.login({
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
                user.verify(code, {
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
                user.set('username', mobile);
                user.save();
            }
        },
        render: function() {
            this.$('input').val('');
            var logged_in = Amour.TokenAuth.get() != null;
            this.$('.login-box').toggleClass('hidden', logged_in);
            this.$('.play-box').toggleClass('hidden', !logged_in);
            return this;
        }
    }))({el: $('#view-home')});
    
});
