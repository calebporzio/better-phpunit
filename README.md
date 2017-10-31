# Better PHPUnit

![Demo GIF](demo.gif)

## Running a specific test method:
- Place your cursor in/on the method you want to run
- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run`

## Running an entire test file:
- Place your cursor on/above the class declaration line
- Open the command menu: `cmd+shift+p`
- Select: `Better PHPUnit: run`

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

## Roadmap:
- Handling PHP fatal and parser errors
- A sidebar panel for managing errors
- Re-run failures