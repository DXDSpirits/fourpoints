
# encoding=utf-8

from .models import Question, Choice


QUESTIONS = [
    {
        'text': u'西西里什么景点最好玩',
        'choices': [u'海岛', u'山洞', u'卫城', u'小镇']
    }, {
        'text': u'西西里在哪个国家',
        'choices': [u'意大利', u'西班牙', u'法国', u'希腊']
    }, {
        'text': u'西西里是什么气候',
        'choices': [u'地中海气候', u'海洋性气候', u'季风气候', u'大陆性气候']
    }, {
        'text': u'西西里和科西嘉是同一个地方么',
        'choices': [u'一直不是', u'以前是现在不是', u'以前不是现在是', u'一直是']
    }, {
        'text': u'西西里的有什么好吃的特产',
        'choices': [u'香肠', u'匹萨', u'汉堡', u'牛肉']
    }, {
        'text': u'下面哪个是法国著名球星',
        'choices': [u'里贝里', u'外贝外', u'上贝上', u'下贝下']
    }, {
        'text': u'下面哪个难题是NP完全问题',
        'choices': [u'汉密尔顿回路', u'欧拉回路', u'最小生成树', u'单源最短路径']
    }, {
        'text': u'邓布利多和甘道夫是同一个演员吗',
        'choices': [u'不一直是', u'一直是', u'一直不是', u'选我肯定是错的']
    }, {
        'text': u'坎昆和以下哪个城市最近',
        'choices': [u'佛罗里达', u'纽约', u'莫斯科', u'伦敦']
    }, {
        'text': u'以下哪支国家队没有出现在2008年欧洲杯中',
        'choices': [u'英格兰', u'意大利', u'荷兰', u'德国']
    }
]


def random_questions(city):
    for q in QUESTIONS:
        question = Question.objects.create(city = city,
                                           text = q['text'])
        choices = [Choice(question = question,
                          text = text,
                          right = (index == 0))
                   for index, text in enumerate(q['choices'])]
        Choice.objects.bulk_create(choices)
