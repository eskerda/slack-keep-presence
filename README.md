# slack-keep-presence

Keeps your slack user active whenever auto-away kicks in.

## Installation

```
$ npm install slack-keep-presence
```

## Usage

> Following assumes `$HOME/node_modules/.bin` is present on your `$PATH`

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

## Motivation

https://twitter.com/slackhq/status/448966862521786368
> Disabling auto-away isn't on our immediate roadmap, but it's on our "someday"
list. Stay tuned! ✨

Auto-away in slack is annoying. Not lurking around slack for 30 minutes does not
mean not being available for anyone to ping and "someday" seems a bit vague for
an essential feature like this. Fortunately using the slack API it's easy to
circumvent this restriction.
