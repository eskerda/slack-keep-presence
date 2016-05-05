# slack-keep-presence

![example](http://i.imgur.com/jZ1osWk.png)

Keeps your slack user active whenever auto-away kicks in. Also logs or shows
a system notification whenever you are mentioned or receive a DM. Perfect
for these ocasions when you feel like… slacking from Slack.

## Usage

> Following assumes `$HOME/node_modules/.bin` is present on your `$PATH`

```
$ slack-keep-presence --help
usage: slack-keep-presence [-h] [-t TOKEN] [-d] [-n]

Keeps your user active whenever auto-away kicks in

Optional arguments:
  -h, --help            Show this help message and exit.
  -t TOKEN, --token TOKEN
                        Your slack token. Can be set by env var SLACK_TOKEN. 
                        Get one at https://api.slack.com/web
  -d, --debug           Log all slack RTM events (default: false)
  -n, --notifications   Try to use system notifications for mentions and 
                        DMs(default: false)
```

### Examples

```
$ slack-keep-presence -t <your token>
```
```
$ SLACK_TOKEN=<your_token> slack-keep-presence
```
Easiest is to define `SLACK_TOKEN` environment variable and just run it as
```
$ slack-keep-presence
```

You can get a token linked to your user at https://api.slack.com/docs/oauth-test-tokens

## Installation

```
$ npm install slack-keep-presence
```


## Motivation

https://twitter.com/slackhq/status/448966862521786368
> Disabling auto-away isn't on our immediate roadmap, but it's on our "someday"
list. Stay tuned! ✨

Auto-away in slack is annoying. Not lurking around slack for 30 minutes does not
mean not being available for anyone to ping and "someday" seems a bit vague for
an essential feature like this. Fortunately using the slack API it's easy to
circumvent this restriction.
