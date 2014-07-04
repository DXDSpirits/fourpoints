define(function() {
    
    //$('.views-wrapper').height($(window).height());
    
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
