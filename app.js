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

var args = parser.parseArgs();
if (!args['token']) {
    return parser.printHelp();
}

var slack_presence = new SlackPresence(args['token'], args['debug']);
slack_presence.init();
