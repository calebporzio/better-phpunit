const vscode = require('vscode');
const assert = require('assert');
const CommandInstance = require('./command-instance');

var globalCommandInstance;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        await runCommand(new CommandInstance);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-suite', async () => {
        await runCommand((new CommandInstance).runEntireSuite());
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        await runPreviousCommand();
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            return [new vscode.Task(
                { type: "phpunit", task: "run" },
                "run",
                'phpunit',
                new vscode.ShellExecution(globalCommandInstance.shellCommand),
                '$phpunit'
            )];
        }
    }));

    context.subscriptions.push(disposables);
}

async function runCommand(commandInstance) {
    setGlobalCommandInstance(commandInstance);

    vscode.window.activeTextEditor
        || vscode.window.showErrorMessage('Better PHPUnit: open a file to run this command');

    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
}

async function runPreviousCommand() {
    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
}

function setGlobalCommandInstance(commandInstance) {
    // Store this object globally for the provideTasks, "run-previous", and for tests to assert against.
    globalCommandInstance = commandInstance;
}

// This method is exposed for testing purposes.
module.exports.getGlobalCommandInstance = function () {
    return globalCommandInstance;
}