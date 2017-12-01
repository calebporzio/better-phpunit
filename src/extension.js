const vscode = require('vscode');
const assert = require('assert');
const CommandInstance = require('./command-instance');

var currentCommandInstance;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        // It's important that "better-phpunit.run" is the activation event for this package.
        // Otherwise, "currentCommandInstance" won't be available to the rest of the package.
        currentCommandInstance = new CommandInstance;

        await vscode.commands.executeCommand('workbench.action.terminal.clear');
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        await vscode.commands.executeCommand('workbench.action.terminal.clear');
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            // new vscode.TaskScope.Global
            return [new vscode.Task(
                { type: "phpunit", task: "run" },
                "run",
                'phpunit',
                new vscode.ShellExecution(currentCommandInstance.shellCommand),
                '$phpunit'
            )];
        }
    }));

    context.subscriptions.push(disposables);
}

// This method is exposed for testing purposes.
module.exports.getCurrentCommandInstance = function () {
    return currentCommandInstance;
}