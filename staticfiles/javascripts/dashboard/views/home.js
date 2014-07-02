define(['app'], function(App) {
    
    var StoryGalleryView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: {
                'click': 'onSelect'
            },
            className: 'story-item img text-center',
            template: '<p>{{name}}</p><p>{{title}}</p>',
            initModelView: function() {},
            onSelect: function() {
                window.location.href = '/storyguide/' + this.model.get('name');
            },
            attributes: function() {
                return {
                    'data-bg-src': this.model.get('avatar')
                };
            }
        })
    });
    
    App.Pages.Home = new (Amour.PageView.extend({
        events: {
            'click .btn-add': 'addStory'
        },
        initPage: function() {
            this.stories = new Amour.Collections.Stories();
            this.views = {
                storyGalleryView: new StoryGalleryView({
                    collection: this.stories,
                    el: this.$('.stories-wrapper')
                })
            };
        },
        addStory: function() {
            App.router.goTo('NewStory');
        },
        render: function() {
            this.stories.fetch();
        }
    }))({el: $('#view-home')});
    
});
