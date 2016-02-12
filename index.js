"use strict"

var SlackRTM = require('slackbotapi');
var Slack = require('slack-node');
var logger = require('jethro');
var util = require('util');

class SlackPresence {
    constructor(token, debug) {
        debug = Boolean(debug) || false;
        this.token = token;
        this.slack = new Slack(token);
        this.slackrtm = new SlackRTM({
            'token': token,
            'logging': debug,
            'autoReconnect': true,
        });
    }

    log(msg, level) {
        level = level || 'info';
        logger(level, 'SlackPresence', msg);
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
}

module.exports = SlackPresence;
