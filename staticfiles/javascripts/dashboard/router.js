define(['app'], function(App) {
    
    var PageRouter = function(pages) {
        this.pages = pages;
        this.history = { active: null, stack: [] };
        this.goTo = function(pageName, options) {
            var next = this.pages[pageName];
            (options || (options = {})).caller = options.caller || this.history.active;
            if (next != this.history.active) {
                this.history.active && this.history.stack.push(this.history.active);
                this.history.active = next;
                this.history.active.go(options);
            }
        };
        this.clearHistory = function() {
            this.history.stack.length = 0;
        };
        this.refreshActivePage = function() {
            var active = this.history.active;
            active && this.history.active.refresh();
        };
        this.goBack = function() {
            if (this.history.stack.length > 0) {
                var prev = this.history.stack.pop();
                this.history.active = prev;
                this.history.active.showPage({reverse: true});
            }
        };
    };
    
    var pageRouter = new PageRouter(App.Pages);
    App.user.on('login', function() {
        pageRouter.refreshActivePage();
    });
    
    App.router = new (Backbone.Router.extend({
        navigate: function(fragment, options) {
            options = options || {};
            options.trigger = !(options.trigger === false);
            Backbone.Router.prototype.navigate.call(this, fragment, options);
        },
        initialize: function(){
            this.route('', 'index');
            this.route('home', 'home');
            this.route(/region\/(\d+)/, 'region');
            this.route(/city\/(\d+)/, 'city');
            this.route(/question\/(\d+)/, 'question');
            this.route('instruction', 'instruction');
            this.route('score', 'score');
            this.route('ranking', 'ranking');
            this.route('login', 'login');
        },
        index: function() {
            this.navigate('home');
        },
        home: function() {
            pageRouter.goTo('Home');
        },
        instruction: function() {
            pageRouter.goTo('Instruction');
        },
        region: function(rid) {
            pageRouter.goTo('Region', { regionId: rid });
        },
        city: function(cid) {
            pageRouter.goTo('City', { cityId: cid });
        },
        question: function(cid) {
            pageRouter.goTo('Question', { cityId: cid });
            this.navigate('', { trigger: false });
        },
        score: function() {
            pageRouter.goTo('Score');
            this.navigate('', { trigger: false });
        },
        ranking: function(storyId) {
            pageRouter.goTo('Ranking');
            this.navigate('', { trigger: false });
        },
        login: function() {
            pageRouter.goTo('Login');
        }
    }))();
    
    App.router.on('route', function(hash) {
        ga('send', 'pageview', location.pathname + location.search  + location.hash);
    });
    
});
