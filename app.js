#!/usr/bin/env node

"use strict"

var fs = require('fs');
var path = require('path');

var argparse = require('argparse');
var toml = require('toml');
var _ = require('lodash');

var SlackPresence = require('./');

var parser = new argparse.ArgumentParser({
    description: 'Keeps your user active whenever auto-away kicks in',
});

parser.addArgument(['-t', '--token'], {
    addHelp: true,
    help: ['Your slack token. Can be set by env var SLACK_TOKEN.',
           'Get one at https://api.slack.com/web'].join('\n'),
});

parser.addArgument(['-d', '--debug'], {
    addHelp: true,
    help: 'Log all slack RTM events',
    action: 'storeConst',
    constant: true,
});

parser.addArgument(['-n', '--notifications'], {
    addHelp: true,
    help: 'Try to use system notifications for mentions and DMs',
    action: 'storeConst',
    constant: true,
});

parser.addArgument(['-m', '--msg'], {
    addHelp: true,
    help: '(Auto Away) Respond to mentions and PM with this msg',
});

parser.addArgument(['-c', '--config'], {
    addHelp: true,
    help: 'Read config file',
});


var args = parser.parseArgs();
// remove unset things from args
_.each(args, function(value, key, list) {
    if (value == null || value == undefined)
        delete list[key];
});

var config_path;
if (args['config']) {
    config_path = path.join(process.cwd(), args['config'])
} else {
    config_path = path.join(process.env.HOME, '.config/slack-keep-presence')
}

fs.readFile(config_path, 'utf8', function(err, data) {
    var config;
    if (err) {
        if (args['config']) {
            console.error('No such file:', args['config']);
            process.exit(1);
        }
        // Otherwise, failure to read $HOME/.config/slack-keep-presence is not
        // a big deal
        config = args;
    } else {
        // Read TOML file
        try {
            config = toml.parse(data);
        } catch (e) {
            console.error("Error parsing configuration file:",
                          "L" + e.line, "C" + e.column, e.message);
            process.exit(1);
        }
        config = _.defaultsDeep(args, config);
    }
    var token;
    if (process.env.SLACK_TOKEN) {
        token = process.env.SLACK_TOKEN;
    } else {
        token = config['token'];
    }
    if (!token) {
        console.error("Token not configured, see usage:");
        return parser.printHelp();
    }

    var slack_presence = new SlackPresence(token, config);
    slack_presence.init();
});
