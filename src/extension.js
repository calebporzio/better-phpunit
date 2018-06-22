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

    context.subscriptions.push(disposables);
}

async function runCommand(command) {
    setGlobalCommandInstance(command);

    vscode.window.activeTextEditor
        || vscode.window.showErrorMessage('Better PHPUnit: open a file to run this command');

    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    const terminal = getTerminal();
    await terminal.sendText(globalCommand.output, true);
}

async function runPreviousCommand() {
    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    const terminal = getTerminal();
    await terminal.sendText(globalCommand.output, true);
}

function getTerminal() {
    const terminal = vscode.window.createTerminal('better-phpunit');
    terminal.show();
    return terminal;
}

function setGlobalCommandInstance(commandInstance) {
    // Store this object globally for the provideTasks, "run-previous", and for tests to assert against.
    globalCommand = commandInstance;
}

// This method is exposed for testing purposes.
module.exports.getGlobalCommandInstance = function () {
    return globalCommand;
}
