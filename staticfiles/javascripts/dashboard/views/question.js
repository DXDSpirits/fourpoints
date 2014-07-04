define(['app'], function(App) {
    
    var QuestionsView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            template: '<p><strong>{{text}}</strong></p>{{#choices}}<p class="radio"><label><input type="radio" value="{{id}}" name=question-{{question}}> {{text}}</label></p>{{/choices}}',
            className: 'question-item'
        })
    });
    
    App.Pages.Question = new (Amour.PageView.extend({
        events: {
            'click .btn-finish': 'finish'
        },
        initPage: function() {
            this.play = null;
            this.questions = new Amour.Collection();
            this.views = {
                questions: new QuestionsView({
                    collection: this.questions,
                    el: this.$('.question-list')
                })
            }
        },
        finish: function() {
            var answers = this.questions.reduce(function(answers, question) {
                return answers.concat({
                    question: question.id,
                    choice: +this.$('input[name=question-' + question.id + ']:checked').val()
                });
            }, [], this);
            this.play.save({
                answers: answers
            }, {
                success: function() {
                    App.router.goTo('Ranking');
                }
            });
        },
        newPlay: function() {
            this.play = App.plays.create({
                city: this.options.cityId,
                platform: App.isWeixin ? 'weixin' : 'weibo'
            });
        },
        render: function() {
            this.newPlay();
            if (this.options.questions) {
                this.questions.set(this.options.questions)
            }
        }
    }))({el: $('#view-question')});
    
});
