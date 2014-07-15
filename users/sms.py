
# encoding=utf-8

from django.utils.http import urlencode
import logging
import urllib2

logger = logging.getLogger('apps')

def http_request(url, args = None, post_args = None):
    args = args or {}
    post_data = None if post_args is None else urlencode(post_args)
    
    try:
        url = url + "?" + urlencode(args)
        logger.debug(url)
        response = urllib2.urlopen(url, post_data)
        result = response.read()
        response.close()
        return result
    except urllib2.HTTPError, e:
        logger.error(e.read())


def send_sms(dest, content):
    result = http_request(url = 'http://59.151.46.205:8888/sms.aspx',
                          post_args = {'userid': '140',
                                       'account': 'xidawu',
                                       'password': 'xidawu0710',
                                       'action': 'send',
                                       'mobile': dest,
                                       'content': unicode(content),
                                       'sendTime': '',
                                       'extno': ''})
    logger.info('SMS Sent to %s %s' % (str(dest), str(result)))


def send_veriry_code(mobile, code):
    send_sms(mobile, u'您的验证码是%s，感谢您参加本次游戏。' % code)
