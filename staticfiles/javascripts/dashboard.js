require([
    'app',
    'router',
    'views/autoload'
], function(App) {
    window.App = App;
    App.start();
});
