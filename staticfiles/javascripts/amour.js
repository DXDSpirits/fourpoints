(function() {
    
    new FastClick(document.body);
    
    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    
    var Amour = {
        version: '1.0',
        APIHost: $('meta[name="APIHost"]').attr('content'),
        CDNURL: $('meta[name="CDNURL"]').attr('content')
    };
    
    /*
     * Events and Routers
     */
    
    // Allow the `Backbone` object to serve as a global event bus
    _.extend(Amour, Backbone.Events);
    
    var EventAggregator = Amour.EventAggregator = (function() {
        var EA = function() {};
        EA.extend = Backbone.Model.extend;
        _.extend(EA.prototype, Backbone.Events);
        return EA;
    })();
    
    var Router = Amour.Router = function(pages) {
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
            this.history.active.refresh();
        };
        this.goBack = function() {
            if (this.history.stack.length > 0) {
                var prev = this.history.stack.pop();
                this.history.active = prev;
                this.history.active.showPage({reverse: true});
            }
        };
    };
    
    /*
     * Models and Views
     */
    
    var Model = Amour.Model = Backbone.Model.extend({
        initialize: function() {
            if (this.initModel) this.initModel();
        },
        url: function() {
            var origUrl = Backbone.Model.prototype.url.call(this);
            return origUrl + (origUrl.charAt(origUrl.length - 1) == '/' ? '' : '/');
        }
    });
    
    var Collection = Amour.Collection = Backbone.Collection.extend({
        model: Model,
        initialize: function() {
            if (this.initCollection) this.initCollection();
        },
        parse: function(response) {
            if (response.results != null) {
                this.count = response.count;
                this.previous = response.previous;
                this.next = response.next;
                return response.results;
            } else {
                return response;
            }
        }
    });
    
    var View = Amour.View = Backbone.View.extend({
        initialize: function(options) {
            if (this.initView) this.initView(options || {});
        },
        renderTemplate: function(attrs, template) {
            var template = template || this.template || '';
            var attrs = this.mixinTemplateHelpers(attrs);
            this.$el.html(Mustache.render(template, attrs));
            this.$el.find('img[data-src]').addBack('img[data-src]').each(function() {
                Amour.loadImage($(this), $(this).data('src'));
            });
            this.$el.find('.img[data-bg-src]').addBack('.img[data-bg-src]').each(function() {
                Amour.loadBgImage($(this), $(this).data('bg-src'));
            });
            return this;
        },
        mixinTemplateHelpers: function(target){
            var target = target || {};
            return _.extend(target, this.templateHelpers);
        },
    });
    
    var ModelView = Amour.ModelView = View.extend({
        initView: function() {
            if (this.model) {
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model, 'hide', this.hide);
            }
            if (this.initModelView) this.initModelView();
        },
        hide: function() {
            this.remove();
        },
        serializeData: function() {
            return this.model ? this.model.toJSON() : {};
        },
        render: function() {
            return this.renderTemplate(this.serializeData());
        }
    });
    
    var CollectionView = Amour.CollectionView = View.extend({
        ModelView: ModelView,
        initView: function() {
            if (this.collection) {
                this.listenTo(this.collection, 'reset', this.addAll);
                this.listenTo(this.collection, 'add', this.addOne);
                this.listenTo(this.collection, 'remove', this.removeOne);
            }
            if (this.initCollectionView) this.initCollectionView();
        },
        renderItem: function(item) {
            var modelView = new this.ModelView({model: item});
            return modelView.render().el;
        },
        removeOne: function(item) {
            item.trigger('hide');
        },
        addOne: function(item) {
            this.$el.append(this.renderItem(item));
        },
        addAll: function(_collection, options) {
            if (options && options.previousModels) {
                _.each(options.previousModels, function(model) {
                    model.trigger('hide');
                });
            }
            if (this.collection) {
                var nodelist = this.collection.reduce(function(nodelist, item) {
                    return nodelist.concat(this.renderItem(item));
                }, [], this);
                this.$el.html(nodelist);
            }
        },
        render: function() {
            this.addAll();
            return this;
        }
    });
    
    var PageView = Amour.PageView = Amour.View.extend({
        disablePage: function() {
            this.undelegateEvents();
            this.go = function() {};
            this.refresh = function() {};
            this.showPage = function() {};
        },
        initView: function() {
            if (!this.el) {
                this.disablePage();
                return;
            }
            this.views = {};
            _.bindAll(this, 'showPage', 'go', 'refresh', 'render', 'reset');
            var $el = this.$el;
            this.$el.on('webkitAnimationEnd', function(e) {
                var animationName = e.originalEvent.animationName;
                if (animationName == "slideouttoleft" || animationName == "slideouttoright") {
                    $el.trigger('pageClose');
                } else if (animationName == "slideinfromright" || animationName == "slideinfromleft") {
                    $el.trigger('pageOpen');
                }
            });
            if (this.initPage) this.initPage();
        },
        go: function(options) {
            this.options = options || {};
            this.reset();
            var timeout;
            var render = this.render, pageOpen = function() {
                clearTimeout(timeout);
                render();
            };
            timeout = setTimeout(pageOpen, 1000);
            this.$el.one('pageOpen', pageOpen);
            this.showPage();
        },
        refresh: function() {
            var timeout;
            var render = this.render, pageOpen = function() {
                clearTimeout(timeout);
                render();
            };
            timeout = setTimeout(pageOpen, 1000);
            this.$el.one('pageOpen', pageOpen);
            this.showPage();
        },
        reset: function() {},
        showPage: function(options) {
            var options = options || {};
            if (this.$el && this.$el.hasClass('view-hidden')) {
                var $curPage = $('.view:not(".view-hidden")');
                var curPageCloseTimeout;
                var closeCurPage = function() {
                    clearTimeout(curPageCloseTimeout);
                    $curPage.removeClass('view-prev').removeClass('view-prev-reverse');
                    $curPage.find('input').blur();
                };
                $curPage.addClass('view-hidden');
                $curPage.addClass('view-prev');
                if (options.reverse) $curPage.addClass('view-prev-reverse');
                curPageCloseTimeout = setTimeout(closeCurPage, 1000);
                $curPage.one('pageClose', closeCurPage);
                
                var $nextPage = this.$el;
                var nextPageOpenTimeout;
                var openNextPage = function() {
                    clearTimeout(nextPageOpenTimeout);
                    $nextPage.removeClass('view-next').removeClass('view-next-reverse');
                    $nextPage.find('input').blur();
                    window.scrollTo(0, 0);
                };
                $nextPage.removeClass('view-hidden');
                $nextPage.addClass('view-next');
                if (options.reverse) $nextPage.addClass('view-next-reverse');
                nextPageOpenTimeout = setTimeout(openNextPage, 1000);
                $nextPage.one('pageOpen', openNextPage);
            }
        }
    });
    
    /*
     * Utility Functions
     */
    
    Amour.imageFullpath = function(src) {
        return /^http:\/\//.test(src) ? src : Amour.CDNURL + src;
    };
    
    Amour.loadImage = function(img, src, options) {
        if (!src) return;
        options = options || {};
        var image = new Image(), image_src = Amour.imageFullpath(src);
        image.onload = function() {
            img.attr('src', image_src);
        };
        image.src = image_src;
    };
    
    Amour.loadBgImage = function(el, src, options) {
        if (!src) return;
        options = options || {};
        el.css('background-image', 'url(' + Amour.CDNURL + 'images/loading.gif' + ')');
        var image = new Image(), image_src = Amour.imageFullpath(src);
        image.onload = function() {
            el.removeClass('img-loading');
            el.css('background-image', 'url(' + image_src + ')');
        };
        el.addClass('img-loading');
        image.src = image_src;
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
        urlRoot: Amour.APIHost + '/polls/city/',
    });
    
    Amour.Collections.Cities = Amour.Collection.extend({
        url: Amour.APIHost + '/polls/city/',
        model: Amour.Models.City
    });
    
    Amour.Models.Play = Amour.Model.extend({
        urlRoot: Amour.APIHost + '/users/play/',
    });
    
    Amour.Collections.Plays = Amour.Collection.extend({
        url: Amour.APIHost + '/users/play/',
        model: Amour.Models.Play,
        citiesPlayed: function() {
            return _.uniq(this.pluck('city'));
        }
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
    
    /*
     * Initializations
     */
    
    var initSync = function () {
        var authToken = localStorage.getItem('auth-token');
        var originalSync = Backbone.sync;
        Backbone.sync = function (method, model, options) {
            if (authToken) {
                _.extend((options.headers || (options.headers = {})), { 'Authorization': 'Token ' + authToken });
            }
            return originalSync.call(model, method, model, options);
        };
        Amour.TokenAuth = {
            get: function () {
                return _.clone(authToken);
            },
            set: function (token) {
                authToken = _.clone(token);
                localStorage.setItem('auth-token', authToken);
            },
            clear: function () {
                authToken = null;
                localStorage.removeItem('auth-token');
            }
        };
    };
    
    var initAjaxEvents = function () {
        _.extend((Amour.ajax = {}), Backbone.Events);
        $(document).ajaxStart(function () {
            Amour.ajax.trigger('start');
        });
        $(document).ajaxStop(function () {
            Amour.ajax.trigger('stop');
        });
        $(document).ajaxError(function (event, jqxhr, settings, exception) {
            var response = jqxhr.responseJSON || {};
            if (jqxhr.status == 401 || jqxhr.status == 403 || jqxhr.status == 499) {
                Amour.TokenAuth.clear();
                Amour.ajax.trigger('unauthorized');
            } else if (settings.type == 'GET' && jqxhr.statusText != 'abort') {
                Amour.ajax.trigger('error');
            }
        });
    };
    
    /* 
     * Export
     */
    initSync();
    initAjaxEvents();
    window.Amour = Amour;
    
})();
