define(function() {
    
    var App = {
        Models: {},
        Views: {},
        Pages: {}
    };
    
    App.isWeixin = /MicroMessenger/i.test(navigator.userAgent);
    App.isWeixin = true;
    
    App.router = new Amour.Router(App.Pages);
    
    $('body').on('click', '.header-navbar > ul > li', function(e) {
        if (e.preventDefault) e.preventDefault();
        var curPage = App.router.history.active;
        if (curPage == App.Pages.Question) return;
        var $el = $(e.currentTarget);
        var target = $el.data('target');
        if (curPage == App.Pages.Ranking || curPage == App.Pages.Instruction || target != 'Home') {
            $el.addClass('active').siblings().removeClass('active');
            App.router.goTo(target);
        }
    });
    
    /*
     * Ajax Events
     */
    
    var timeout = 1000;
    
    Amour.ajax.on('start', function() {
        $('#apploader').removeClass('invisible');
    });
    
    Amour.ajax.on('stop', function() {
        setTimeout(function () {
            $('#apploader').addClass('invisible');
            timeout = 1000;
        }, timeout);
    });
    
    Amour.ajax.on('error', function() {
        $('#apploader .ajax-error').removeClass('hidden');
        setTimeout(function () {
            $('#apploader .ajax-error').addClass('hidden');
        }, (timeout = 2500));
    });
    
    var fillImages = function() {
        $('img[data-src]').each(function() {
            var src = $(this).data('src');
            src && Amour.loadImage($(this), src);
        });
        $('.img[data-bg-src]').each(function() {
            var src = $(this).data('bg-src');
            src && Amour.loadBgImage($(this), src);
        });
    };
    
    /*
     * Models and Collections API
     */
    
    Amour.Models = {};
    Amour.Collections = {};
    
    Amour.Models.Region = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/polls/region/'
    });
    
    Amour.Collections.Regions = Amour.Collection.extend({
        url: Amour.APIHost + '/polls/region/',
        model: Amour.Models.Region
    });
    
    Amour.Models.City = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/polls/city/'
    });
    
    Amour.Collections.Cities = Amour.Collection.extend({
        url: Amour.APIHost + '/polls/city/',
        model: Amour.Models.City
    });
    
    Amour.Models.Play = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/play/'
    });
    
    Amour.Collections.Plays = Amour.Collection.extend({
        url: Amour.APIHost + '/users/play/',
        model: Amour.Models.Play,
        citiesPlayed: function() {
            return _.uniq(this.pluck('city'));
        },
        timesToday: function() {
            return this.filter(function(play) {
                return moment().dayOfYear() == moment(play.get('time_created')).dayOfYear()
            }).length;
        }
    });
    
    Amour.Models.Ranking = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/ranking/'
    });
    
    Amour.Collections.Rankings = Amour.Collection.extend({
        url: Amour.APIHost + '/users/ranking/',
        model: Amour.Models.Ranking
    });
    
    Amour.Models.User = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/user/',
        initModel: function() {},
        login: function(auth, options) {
            this.clear().set(auth);
            options = options || {};
            options.url = Amour.APIHost + '/token-auth/';
            var success = options.success;
            options.success = function(model, response, options) {
                Amour.TokenAuth.set(response.token);
                if (success) success(model, response, options);
                model.trigger('login');
            };
            this.save({}, options);
        },
        verify: function(code, options) {
            options = options || {};
            options.url = this.url() + 'verify/';
            this.save({code: code}, options);
        }
    });
    
    Amour.TokenAuth.clear();
    App.user = new Amour.Models.User();
    App.plays = new Amour.Collections.Plays();
    
    App.user.on('login', function() {
        App.user.fetch();
        App.plays.fetch({reset:true});
    });
    
    App.start = function() {
        fillImages();
        if (Amour.TokenAuth.get() != null) App.user.trigger('login')
        App.router.goTo('Home');
    };
    
    return App;
});
