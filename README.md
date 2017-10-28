# Better PHPUnit

![Demo GIF](demo.gif)

## How To Run:
- Place your cursor in the file/method you want to run
- Open the command menu: `cmd+shift+p`
- Select: `Tasks: Run Task`
- Select: `phpunit: method` to run a phpunit method
- Select: `phpunit: file` to run a phpunit file

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

## Roadmap:
- Running specific test suites
- Not using tasks, but using plain commands?
- Handling PHP fatal and parser errors
- A sidebar panel for managing errors
- Re-run failures