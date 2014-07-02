define(['app'], function(App) {
    
    App.Pages.NewStory = new (Amour.PageView.extend({
        events: {
            'click .btn-save': 'saveStory'
        },
        initPage: function() {},
        saveStory: function() {
            var story = new Amour.Models.Story({
                name: this.$('[name=name]').val(),
                schema: +this.$('[name=schema]').val(),
                title: this.$('[name=title]').val()
            });
            story.save({}, {
                success: function() {
                    App.router.goBack();
                }
            });
        },
        render: function() {}
    }))({el: $('#view-city')});
    
});
