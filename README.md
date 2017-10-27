# Better PHPUnit

![Demo GIF](demo.gif)

## Features:
- Color output!
- Run individual methods by placing your cursor anywhere in the method
- Test failures are displayed in the "Problems" panel for quick access

> Note: this plugin registers "tasks" to run phpunit, not a command like other extensions. This makes it possible to leverage the problem output and color terminal.

Keybindings:
> Note: you will have to add these bindings to your own `keybindings.json` file, otherwise, the bindings will not work right.
```
{
    "key": "cmd+k cmd+o",
    "command": "workbench.action.tasks.runTask",
    "args": "phpunit: method"
},
{
    "key": "cmd+k cmd+i",
    "command": "workbench.action.tasks.runTask",
    "args": "phpunit: file"
}
```