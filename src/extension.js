const vscode = require('vscode');
const assert = require('assert');
const PhpUnitCommand = require('./phpunit-command');
const RemotePhpUnitCommand = require('./remote-phpunit-command.js');

let globalCommand;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        const command = vscode.workspace.getConfiguration("better-phpunit").get("ssh.enable")
            ? new RemotePhpUnitCommand
            : new PhpUnitCommand;

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-suite', async () => {
        const command = vscode.workspace.getConfiguration("better-phpunit").get("ssh.enable")
            ? new RemotePhpUnitCommand({ runFullSuite: true })
            : new PhpUnitCommand({ runFullSuite: true });

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        await runPreviousCommand();
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            return [new vscode.Task(
                { type: "phpunit", task: "run" },
                vscode.TaskScope[vscode.workspace.getConfiguration('better-phpunit').get('enviroment')],
                "run",
                'phpunit',
                new vscode.ShellExecution(globalCommand.output),
                '$phpunit'
            )];
        },
    }));

    context.subscriptions.push(disposables);
}

async function runCommand(command) {
    setGlobalCommandInstance(command);

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
    globalCommand = commandInstance;
}

// This method is exposed for testing purposes.
module.exports.getGlobalCommandInstance = function () {
    return globalCommand;
}
