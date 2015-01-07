define([
    'app',
    'pageview'
], function(App, PageView) {
    
    var QuestionsView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            template: '<p class="title">{{index}}. {{text}}</p>' + 
                      '<div class="icon-up-down"><i class="fa fa-chevron-down"></i><i class="fa fa-chevron-up"></i></div>' + 
                      '<div class="choices">' + 
                      '{{#choices}}<p class="radio"><label><input type="radio" value="{{id}}" name=question-{{question}}> {{text}}</label></p>{{/choices}}' +
                      '</div>',
            className: 'question-item',
            events: {
                'click .title,.icon-up-down': 'onClickTitle',
                'click .radio': 'completeQuestion'
            },
            onClickTitle: function() {
                if (!this.$el.hasClass('open')) {
                    this.$el.addClass('open')
                        .siblings().removeClass('open');
                } else {
                    this.$el.removeClass('open');
                }
            },
            completeQuestion: function() {
                this.$el.addClass('complete');
                this.$el.removeClass('open');
                this.$el.next().addClass('open');
            }
        })
    });
    
    App.Pages.Question = new (PageView.extend({
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
            clearInterval(this.timer);
            $('.global-message').addClass('hidden');
            var answers = this.questions.reduce(function(answers, question) {
                var checked = this.$('input[name=question-' + question.id + ']:checked');
                return checked.length == 0 ? answers : answers.concat({
                    question: question.id,
                    choice: +checked.val()
                });
            }, [], this);
            this.play.save({
                answers: answers
            }, {
                success: function(model) {
                    localStorage.setItem('new-play-id', model.id);
                    App.router.navigate('score');
                }
            });
        },
        newPlay: function() {
            this.play = App.plays.create({
                city: this.options.cityId,
                platform: App.platform
            });
        },
        initMessage: function() {
            $('.global-message .times').text(App.plays.timesToday());
            clearInterval(this.timer);
            var end = moment().add('minutes', 3);
            var $timer = $('.global-message .timer');
            var self = this;
            var timer = this.timer = setInterval(function() {
                var left = end.diff(moment(), 'seconds');
                if (left <= 0) {
                    alert('答题时间到');
                    self.finish();
                } else {
                    dur = moment.duration(left, 'seconds');
                    $timer.text(moment({
                        minute: dur.minutes(),
                        second: dur.seconds()
                    }).format('mm:ss'));
                }
            }, 1000);
        },
        render: function() {
            this.$el.scrollTop(0);
            $('.global-message').removeClass('hidden');
            this.newPlay();
            this.initMessage();
            if (this.options.questions) {
                this.questions.set(this.options.questions)
            } else if (this.options.cityId) {
                var city = new App.Models.City({
                    id: this.options.cityId
                });
                var self = this;
                city.fetch({
                    success: function(model) {
                        var questions = _.sample(model.get('questions'), 5);
                        _.each(questions, function(question, index) {
                            question.index = index + 1
                        });
                        self.questions.set(questions);
                    }
                });
            }
        }
    }))({el: $('#view-question')});
    
});
