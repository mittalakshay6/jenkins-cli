jenkins-cli
===========

Interactive Jenkins command line interface

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jenkins-cli.svg)](https://npmjs.org/package/jenkins-cli)
[![Downloads/week](https://img.shields.io/npm/dw/jenkins-cli.svg)](https://npmjs.org/package/jenkins-cli)
[![License](https://img.shields.io/npm/l/jenkins-cli.svg)](https://github.com/mittalakshay6/jenkins-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g jenkins-cli
$ jenkins COMMAND
running command...
$ jenkins (-v|--version|version)
jenkins-cli/2.0.0 darwin-x64 node-v14.17.5
$ jenkins --help [COMMAND]
USAGE
  $ jenkins COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`jenkins config`](#jenkins-config)
* [`jenkins help [COMMAND]`](#jenkins-help-command)
* [`jenkins logs`](#jenkins-logs)
* [`jenkins run`](#jenkins-run)
* [`jenkins stop`](#jenkins-stop)

## `jenkins config`

CLI configurations

```
USAGE
  $ jenkins config
```

_See code: [src/commands/config.ts](https://github.com/mittalakshay6/jenkins-cli/blob/v2.0.0/src/commands/config.ts)_

## `jenkins help [COMMAND]`

display help for jenkins

```
USAGE
  $ jenkins help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `jenkins logs`

View logs by build number

```
USAGE
  $ jenkins logs
```

_See code: [src/commands/logs.ts](https://github.com/mittalakshay6/jenkins-cli/blob/v2.0.0/src/commands/logs.ts)_

## `jenkins run`

Run the intended job

```
USAGE
  $ jenkins run
```

_See code: [src/commands/run.ts](https://github.com/mittalakshay6/jenkins-cli/blob/v2.0.0/src/commands/run.ts)_

## `jenkins stop`

Stop the build

```
USAGE
  $ jenkins stop
```

_See code: [src/commands/stop.ts](https://github.com/mittalakshay6/jenkins-cli/blob/v2.0.0/src/commands/stop.ts)_
<!-- commandsstop -->
