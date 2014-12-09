define(function() {
    
    var App = {
        Playing: false,
        Models: {},
        Views: {},
        Pages: {}
    };
    
    App.isWeixin = /MicroMessenger/i.test(navigator.userAgent);
    App.platform = App.isWeixin ? 'weixin' : 'weibo';
    
    $('body').on('click', '.header-navbar > ul > li', function(e) {
        if (e.preventDefault) e.preventDefault();
        var curPage = location.hash;
        var $el = $(e.currentTarget);
        var target = $el.data('target');
        if (!App.Playing &&
            (curPage == '#ranking' ||
             curPage == '#instruction' ||
             curPage == '#home')) {
            App.router.navigate(target);
        }
    });
    
    App.showGuideLayer = function(index, once) {
        var itemName = 'guide-layer-shown-' + index;
        if (once && localStorage.getItem(itemName)) return;
        localStorage.setItem(itemName, true);
        var $guide = $('#guide-layer');
        Amour.loadBgImage($guide, 'images/guide-layer-' + index + '.png');
        $guide.removeClass('hidden');
        var hideGuide = _.once(function() {
            $guide.addClass('hidden');
        });
        $guide.one('click', hideGuide);
        _.delay(hideGuide, 3000);
    };
    
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
     * Utilities
     */
    
    App.Text = {
        cleanLineFeed: function(text) {
            return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        },
        toJSON: function(text) {
            return _.compact(this.cleanLineFeed(text).split('\n'));
        },
        toString: function(json) {
            return _.isArray(json) ? json.join('\n') : json;
        }
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
            var today = moment().dayOfYear();
            return this.filter(function(play) {
                return today == moment(play.get('time_created')).dayOfYear()
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
                model.fetch();
            };
            this.save({}, options);
        }
    });
    
    //Amour.TokenAuth.clear();
    App.user = new App.Models.User();
    App.plays = new App.Collections.Plays();
    
    var bindWxSharing = function() {
        var match = window.location.search.match(/[\?\&]radius=(\d+)(&|$)/);
        var radius = match ? +match[1] : 0;
        var message = {
            "img_url": "http://fourpoints.oatpie.com/static/images/fp-logo.jpg",
            "img_width" : "640",
            "img_height" : "640",
            "link" : [window.location.origin, window.location.pathname, '?radius=', radius + 1].join(''),
            "desc" : '福朋自由派, 带你玩转旅行新地点',
            "title" : '福朋自由派, 带你玩转旅行新地点'
        };
        var onBridgeReady = function () {
            WeixinJSBridge.on('menu:share:appmessage', function(argv) {
                WeixinJSBridge.invoke('sendAppMessage', message);
            });
            WeixinJSBridge.on('menu:share:timeline', function(argv) {
                WeixinJSBridge.invoke('shareTimeline', message);
            });
        };
        if (window.WeixinJSBridge) {
            onBridgeReady();
        } else {
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        }
    };
    
    App.start = function() {
        bindWxSharing();
        fillImages();
        App.plays.fetch({
            reset: true,
            data: { platform: App.platform }
        });
        Backbone.history.start();
    };
    
    return App;
});
