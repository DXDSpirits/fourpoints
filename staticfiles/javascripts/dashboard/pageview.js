define(function() {
    
    var pageView = Amour.View.extend({
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
            this.$('.wrapper').on('webkitAnimationEnd', function(e) {
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
    
    return pageView;
    
});
