# slack-keep-presence

Keeps your slack user active whenever auto-away kicks in.

## Installation

```
$ npm install slack-keep-presence
```

## Usage

```
$ slack-keep-presence -t <your token>
```
```
$ SLACK_TOKEN=<your_token> slack-keep-presence
```

You can get a token linked to your user at https://api.slack.com/web

## Motivation

https://twitter.com/slackhq/status/448966862521786368
> Disabling auto-away isn't on our immediate roadmap, but it's on our "someday"
list. Stay tuned! ✨

I do not want to stay tuned. Auto-away in slack is annoying, at least it is to
me. That I've not lurked around slack for 30 minutes does not mean I am not
available for anyone to ping. It baffles me such option is not available or
even on the roadmap. Fortunately the slack API allows for circumventing this
"feature".

As far as I know, Slack clients (packaged browser around the webapp) checks
for activity as a whole and disables auto-away. People using the webapp have
no such option, so there's this.
