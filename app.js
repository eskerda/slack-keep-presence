#!/usr/bin/env node

"use strict"

var argparse = require('argparse');
var SlackPresence = require('./');

var parser = new argparse.ArgumentParser({
    description: 'Keeps your user active whenever auto-away kicks in',
});

parser.addArgument(['-t', '--token'], {
    addHelp: true,
    help: ['Your slack token. Can be set by env var SLACK_TOKEN.',
           'Get one at https://api.slack.com/web'].join('\n'),
    defaultValue: process.env.SLACK_TOKEN,
});

parser.addArgument(['-d', '--debug'], {
    addHelp: true,
    help: 'Log all slack RTM events (default: false)',
    defaultValue: false,
    action: 'storeTrue',
});

parser.addArgument(['-n', '--notifications'], {
    addHelp: true,
    help: 'Try to use system notifications for mentions and DMs' +
          '(default: false)',
    defaultValue: false,
    action: 'storeTrue',
});

var args = parser.parseArgs();
var token = args['token']

if (!token) {
    return parser.printHelp();
}

var slack_presence = new SlackPresence(args['token'], args);
slack_presence.init();
