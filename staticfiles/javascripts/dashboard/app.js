define(function() {
    
    $('.views-wrapper').height($(window).height());
    
    var App = {
        Models: {},
        Views: {},
        Pages: {}
    };
    
    App.router = new Amour.Router(App.Pages);
    
    $('body').on('click', '.footer-navbar .btn-return', function() {
        App.router.goBack();
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
    
    App.start = function() {
        App.router.goTo('Home');
    };
    
    return App;
});
