"use strict"

var SlackRTM = require('slackbotapi');
var Slack = require('slack-node');
var logger = require('jethro');

const util = require('util');
const notifier = require('node-notifier');

class SlackPresence {
    constructor(token, _options) {
        var options = {
            debug: false,
            notifications: false,

        }
        util._extend(options, _options);

        this.options = options;
        this.token = token;
        this.slack = new Slack(token);
        this.slackrtm = new SlackRTM({
            'token': token,
            'logging': this.options['debug'],
            'autoReconnect': true,
        });
        this.users = {};
        if (this.options['notifications']) {
            this.notify('slack-keep-presence is active');
        }
    }

    notify(msg, _options) {
        _options = _options || {};
        var options = {
            title: 'slack-keep-presence',
        };
        util._extend(options, _options);

        notifier.notify({
            title: options['title'],
            message: msg,
        });
    }

    log(msg, level, flag) {
        level = level || 'info';
        flag = flag || 'SlackPresence';
        logger(level, flag, msg);
    }

    get_me(callback) {
        this.log('Getting my user id');
        return this.slack.api('auth.test', function(err, response) {
            this.log('Found ' + response['user_id'])
            callback(response['user_id']);
            this.user_id = response['user_id'];
        }.bind(this));
    }

    init() {
        this.get_me(this.start_presence.bind(this));
    }

    start_presence() {
        this.slackrtm.on('presence_change', this.handle_presence.bind(this));
        this.slackrtm.on('message', this.handle_message.bind(this));
        this.slack.api('users.list', this.store_users.bind(this));
    }

    handle_presence(data) {
        if (data['user'] != this.user_id)
            return;
        this.log('Presence change: ' + data['user'] + ' ' + data['presence'])
        if (data['presence'] != 'away')
            return;
        this.slack.api('users.getPresence', this.check_presence.bind(this));
    }

    check_presence(err, data) {
        if (!data['auto_away'])
            return;
        this.set_active();
    }

    set_active() {
        this.log('Setting myself active');
        this.slack.api('users.setActive', function(err, response) {});
    }

    handle_message(data) {
        // Ignore my messages
        if (data['user'] == this.user_id)
            return;
        // Msg without text?
        if (data['text'] === undefined)
            return

        var direct_message = data['channel'].charAt(0) == 'D';
        var mention = data['text'].indexOf(this.user_id) >= 0;
        if (!direct_message && !mention)
            return;
        var prefix;
        if (mention) {
            prefix = '[M]';
        } else {
            prefix = '[DM]';
        }
        // Check if we have the name of this user (maybe not yet)
        if (data['user'] in this.users) {
            var user_info = this.users[data['user']];
            prefix += ' ' + user_info['real_name'];
        }
        var msg = data['text']
        // Remove <slack actions>
        msg = msg.replace(/\s*_<slack-action.+>_/m, '');
        // Limit msg length to 144 chars
        if (msg.length > 144) {
            msg = msg.substring(0, 144);
            msg += '[...]'
        }

        this.log(prefix + ': ' + msg, 'info');
        if (this.options['notifications']) {
            this.notify(msg, {title: prefix});
        }
   }

   store_users(err, data) {
       for (var i = 0; i < data['members'].length; i++) {
           this.users[data['members'][i]['id']] = data['members'][i];
       }
       this.log('User list cache ready');
   }
}

module.exports = SlackPresence;
