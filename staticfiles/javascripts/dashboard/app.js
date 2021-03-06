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
        if (!App.Playing) {
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
            if (index == 9 && !localStorage.getItem(itemName)) {
                App.shareToWeibo();
            }
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
                return today == moment(play.get('time_created')).dayOfYear();
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
        $('title').text('外出“游礼”，赢免费住宿，测测你旅行地知多少？');
        var image = new Image();
        image.src = 'http://fourpoints.oatpie.com/static/images/fp-avatar.jpg';
        $('body').prepend($(image).css({
            'position': 'absolute',
            'z-index': '-9999',
            'width': '200px'
        }));
        var match = window.location.search.match(/[\?\&]radius=(\d+)(&|$)/);
        var radius = match ? +match[1] : 0;
        var message = {
            "img_url": "http://fourpoints.oatpie.com/static/images/fp-avatar.jpg",
            "img_width" : "640",
            "img_height" : "640",
            "link" : [window.location.origin, window.location.pathname, '?radius=', radius + 1].join(''),
            "desc" : '福朋自由派',
            "title" : '外出“游礼”，赢免费住宿，测测你旅行地知多少？'
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
    
    App.shareToWeibo = function() {
        var getWeiboLink = function(s, d, e, r, l, p, t, z, c) {
            var f = 'http://service.weibo.com/share/share.php?appkey=', u = z || d.location,
            p = ['&url=', e(u), '&title=', e(t || d.title), '&source=', e(r), '&sourceUrl=', e(l), 
                '&content=', c || 'gb2312', '&pic=', e(p || '')].join('');
            return [f, p].join('');
        };
        var url = 'http://fourpoints.oatpie.com/';
        var content  = '#福朋自游派#【外出“游礼”，抢答赢免费住宿】还有更多幸运奖品等你来！玩转旅行新地点，你能得多少分？趣味题目抢答开始>>';
        var pic = 'http://fourpoints.oatpie.com/static/images/fp-avatar.jpg';
        var link = getWeiboLink(screen, document, encodeURIComponent,
                                'http://www.wedfairy.com', 'http://www.wedfairy.com',
                                pic, content, url, 'utf-8');
        window.open(link, '_blank');
    };
    
    App.start = function() {
        if (Amour.isWeixin) {
            bindWxSharing();
        } else {
            $('title').text('#福朋自游派#【外出“游礼”，抢答赢免费住宿】还有更多幸运奖品等你来！玩转旅行新地点，你能得多少分？趣味题目抢答开始');
        }
        fillImages();
        App.plays.fetch({
            //data: { platform: App.platform },
            reset: true
        });
        Backbone.history.start();
    };
    
    return App;
});
