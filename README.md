# Better PHPUnit

![Demo GIF](demo.gif)

## Run a test method:
- Place your cursor in/on the method you want to run
- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run`

## Run a test file:
- Place your cursor on/above the class declaration line
- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run`

or

- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run file`

## Run the entire suite:
- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run suite`

## Run the previous test:
- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run previous`

## Features:
- Color output!
- Run individual methods by placing your cursor anywhere in/on the method
- Test failures are displayed in the "Problems" panel for quick access

> Note: this plugin registers "tasks" to run phpunit, not a command like other extensions. This makes it possible to leverage the problem output and color terminal.

Keybindings:
```
{
    "key": "cmd+k cmd+r",
    "command": "better-phpunit.run"
},
{
    "key": "cmd+k cmd+p",
    "command": "better-phpunit.run-previous"
}
```

Config:
```
{
    "better-phpunit.commandSuffix": null, // This string will be appended to the phpunit command, it's a great place to add flags like '--stop-on-failure'
    "better-phpunit.phpunitBinary": null // A custom phpunit binary. Ex: 'phpunit', '/usr/local/bin/phpunit'
}
```

Running tests over ssh (For VMs like Laravel Homestead):
```
{
    "better-phpunit.ssh.enable": true,
    "better-phpunit.ssh.paths": {
        "/your/local/path": "/your/remote/path"
    },
    "better-phpunit.ssh.user": "user",
    "better-phpunit.ssh.host": "host",
    "better-phpunit.ssh.port": "22"
    "better-phpunit.ssh.binary": "putty -ssh"
}
```

## Wish List:
- Handling PHP fatal and parser errors
- A sidebar panel for managing errors
- Re-run failures