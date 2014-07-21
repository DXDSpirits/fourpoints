define(function() {
    
    var App = {
        Playing: false,
        Models: {},
        Views: {},
        Pages: {}
    };
    
    App.isWeixin = /MicroMessenger/i.test(navigator.userAgent);
    App.platform = App.isWeixin ? 'weixin' : 'weibo';
    
    App.router = new Amour.Router(App.Pages);
    
    $('body').on('click', '.header-navbar > ul > li', function(e) {
        if (e.preventDefault) e.preventDefault();
        var curPage = App.router.history.active;
        var $el = $(e.currentTarget);
        var target = $el.data('target');
        if (!App.Playing &&
            (curPage == App.Pages.Ranking ||
             curPage == App.Pages.Instruction ||
             curPage == App.Pages.Home)) {
            $el.addClass('active').siblings().removeClass('active');
            App.router.goTo(target);
        }
    });
    
    $('body').on('click', '#sharetip .btn', function() {
        $('#sharetip').addClass('hidden');
    });
    
    App.showShareTip = function() {
        if (!localStorage.getItem('user-shared-to-social')) {
            $('#sharetip').removeClass('hidden');
            localStorage.setItem('user-shared-to-social', true);
        }
    }
    
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
    
    App.Models = {};
    App.Collections = {};
    
    App.Models.Region = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/polls/region/'
    });
    
    App.Collections.Regions = Amour.Collection.extend({
        url: Amour.APIHost + '/polls/region/',
        model: App.Models.Region
    });
    
    App.Models.City = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/polls/city/'
    });
    
    App.Collections.Cities = Amour.Collection.extend({
        url: Amour.APIHost + '/polls/city/',
        model: App.Models.City
    });
    
    App.Models.Play = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/play/'
    });
    
    App.Collections.Plays = Amour.Collection.extend({
        url: Amour.APIHost + '/users/play/',
        model: App.Models.Play,
        citiesPlayed: function() {
            return _.uniq(this.pluck('city'));
        },
        timesToday: function() {
            return this.filter(function(play) {
                return moment().dayOfYear() == moment(play.get('time_created')).dayOfYear()
            }).length;
        }
    });
    
    App.Models.Ranking = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/ranking/',
        parse: function(response) {
            var mobile = response.user;
            if (mobile == App.user.get('username')) {
                response.user = '你的成绩';
            } else {
                response.user = [mobile.slice(0,3), '****', mobile.slice(7, 11)].join('');
            }
            return response;
        }
    });
    
    App.Collections.Rankings = Amour.Collection.extend({
        url: Amour.APIHost + '/users/ranking/',
        model: App.Models.Ranking
    });
    
    App.Models.User = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/user/',
        initModel: function() {},
        parse: function(response) {
            return _.isArray(response) ? response[0] : response;
        },
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
        }
    });
    
    //Amour.TokenAuth.clear();
    App.user = new App.Models.User();
    App.plays = new App.Collections.Plays();
    
    App.user.on('login', function() {
        App.user.fetch();
        App.plays.fetch({reset:true});
    });
    
    App.start = function() {
        fillImages();
        if (Amour.TokenAuth.get() != null) App.user.trigger('login')
        var cityId = localStorage.getItem('city-left-from');
        if (cityId != null) {
            localStorage.removeItem('city-left-from');
            App.router.goTo('City', {
                cityId: cityId
            });
        } else {
            App.router.goTo('Home');
        }
    };
    
    return App;
});
