const _ = require('lodash');
const SlackRTM = require('slackbotapi');
const Slack = require('slack-node');
const logger = require('jethro');
const template = require('es6-template-strings');

const notifier = require('node-notifier');

class SlackPresence {
    constructor(token, _options) {
        const options = {
            debug: false,
            notifications: false,
            auto_reply: {
                icon: ':robot_face:',
                username: '[away] ${me}',
                as_me: false,
                in_private: false,
                reply_template: '${msg}',
                warmup: 5,
            },
        }
        // Override default options with passed options
        this.options = _.defaultsDeep(_options, options);
        this.token = token;
        this.slack = new Slack(token);
        this.slackrtm = new SlackRTM({
            'token': token,
            'logging': this.options['debug'],
            'autoReconnect': true,
        });
        // User list cache
        this.users = {};
        // IM list cache
        this.ims = {};

        if (this.options['notifications']) {
            this.notify('slack-keep-presence is active');
        }
        this.warmup = {};
    }

    notify(msg, _options) {
        _options = _options || {};
        const options = {
            title: 'slack-keep-presence',
        };
        _.defaultsDeep(options, _options);

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
        // TODO: dont start until cache list is ready
        this.slack.api('users.list', this.store_users.bind(this));
        this.slack.api('im.list', this.store_im.bind(this));
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
        if (!data['text'])
            return

        const direct_message = data['channel'].charAt(0) == 'D';
        const mention = data['text'].indexOf(this.user_id) >= 0;
        if (!direct_message && !mention)
            return;
        let prefix;
        if (mention) {
            prefix = '[M]';
        } else {
            prefix = '[DM]';
        }
        const user_info = this.users[data['user']];
        const username = user_info ? user_info['real_name'] : data['username'];
        prefix += ' ' + username;
        let msg = data['text']
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

        if (this.options['msg']) {
            this.send_away_msg(data);
        }
   }

   send_away_msg(data) {
       const now = Date.now();
       // Control endless-flood loop
       if (this.warmup[data['channel']] != null) {
           let warmup_time = this.options['auto_reply']['warmup'];
           // Convert minutes to ms
           warmup_time = warmup_time * 1000 * 60
           if (now - this.warmup[data['channel']] < warmup_time) {
               return;
           }
       }

       this.warmup[data['channel']] = now;

       const text = template(this.options['auto_reply']['reply_template'], {
           user: '<@' + data['user'] + '>',
           me: '<@' + this.user_id + '>',
           msg: this.options['msg'],
       });

       let channel;
       if (this.options['auto_reply']['in_private'])
           channel = this.ims[data['user']];
       else
           channel = data['channel'];

       const username = template(this.options['auto_reply']['username'], {
           me: this.users[this.user_id]['name'],
       });

       const message = {
           text: text,
           channel: channel,
           as_user: this.options['auto_reply']['as_me'],
           username: username,
       }
       const icon_uri = template(this.options['auto_reply']['icon'], {
           me: this.users[this.user_id]['profile']['image_original'],
       });

       if (icon_uri.match(/^:.+:$/))
           message['icon_emoji'] = icon_uri;
       else
           message['icon_url'] = icon_uri;
       this.slack.api('chat.postMessage', message, function(err, response) {

       });
   }

   store_users(err, data) {
       _.each(data['members'], function(user) {
           this.users[user['id']] = user;
       }.bind(this));
       this.log('User list cache ready');
   }

   store_im(err, data) {
       _.each(data['ims'], function(im) {
           if (im['is_im']) {
               this.ims[im['user']] = im['id'];
           }
       }.bind(this));
       this.log('IM list cache ready');
   }
}

module.exports = SlackPresence;
