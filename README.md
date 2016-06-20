# slack-keep-presence

![example](http://i.imgur.com/jZ1osWk.png)

Keeps your slack user active whenever auto-away kicks in. Also logs or shows
a system notification whenever you are mentioned or receive a DM. Perfect
for these ocasions when you feel like… slacking from Slack.

## Installation

```
$ npm install slack-keep-presence
```

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
  -d, --debug           Log all slack RTM events
  -n, --notifications   Try to use system notifications for mentions and DMs
  -m MSG, --msg MSG     (Auto Away) Respond to mentions and PM with this msg
  -c CONFIG, --config CONFIG
                        Read config file
```

Check [conf.sample] for [config usage]. This file can be either provided with
the `-c` flag or stored in `$HOME/.config/slack-keep-presence`.


[conf.sample]: https://github.com/eskerda/slack-keep-presence/blob/master/conf.sample
[config usage]: #configuration

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

#### Set an auto-away message

It's good to be slacking, but it's even better to let others know. By passing
a message to command, this will be responded to the channel where the event
happened.

```
$ slack-keep-presence --msg "Currently away, will be back at 10.00 UTC"
```

By default, it will post as a bot (with your name set to away) and
on the channel or direct message where the mention happened.

It's fully configurable through the configuration file. See [conf](#configuration).

## Configuration

To avoid overcrowding the utility with flags, it accepts a config file on
[TOML] format. It can either be passed with `-c path` or set up at
`$HOME/.config/slack-keep-presence`.

[TOML]: https://github.com/toml-lang/toml

### Sample
[conf.sample]

[conf.sample]: https://github.com/eskerda/slack-keep-presence/blob/master/conf.sample

```
# You can set configuration options here. All have been defined with the
# defaults, so you can tweak them at your will

# Your slack token, get one linked to you at https://api.slack.com/docs/oauth-test-tokens
token = "<my token here>"

# Debug all RTM events
debug = false

# Try to use system notifications for mentions and direct messages
notifications = false

[auto_reply]
# If it starts and ends with ':' it's considered an emoji
# If "${me}" is set, it will use your user image
# Accepts urls too
icon = ":robot_face:"

# Accepts "${me}", which will be your name
username = "[away] ${me}"

# Post as me (this overrides icon and username)
as_me = false

# If mention happens on public, respond to user in a private msg
in_private = false

# Template to use to format away message. Defaults to "${msg}"
reply_template = "Hello, ${user} I am away, reason: \"${msg}\""

# Time to wait before sending msg again to channel / DM (in minutes)
warmup = 5
```

## Motivation

https://twitter.com/slackhq/status/448966862521786368
> Disabling auto-away isn't on our immediate roadmap, but it's on our "someday"
list. Stay tuned! ✨

Auto-away in slack is annoying. Not lurking around slack for 30 minutes does not
mean not being available for anyone to ping and "someday" seems a bit vague for
an essential feature like this. Fortunately using the slack API it's easy to
circumvent this restriction.
