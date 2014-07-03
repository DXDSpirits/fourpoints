define(['app'], function(App) {
    
    var user = new Amour.Models.User();
    
    App.Pages.Home = new (Amour.PageView.extend({
        events: {
            'click .btn-signup': 'signup',
            'click .btn-signin': 'signin'
        },
        initPage: function() {
            Amour.ajax.on('unauthorized', this.go);
        },
        signin: function() {
            var username = this.$('input[name=username]').val() || null;
            var password = this.$('input[name=password]').val() || null;
            if (username && password) {
                user.login({ username : username, password : password }, {
                    success : function() {
                        App.router.refreshActivePage();
                    },
                    error : function() {
                        alert('Login failed');
                    }
                });
            }
        },
        signup: function() {
            this.signin();
        },
        render: function() {
            this.$('input').val('');
            return this;
        }
    }))({el: $('#view-home')});
    
});
