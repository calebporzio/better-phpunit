const vscode = require('vscode');
const assert = require('assert');
const CodeLensProvider = require('./codelens-provider');
const PhpUnitCommand = require('./phpunit-command');
const RemotePhpUnitCommand = require('./remote-phpunit-command.js');
const DockerPhpUnitCommand = require('./docker-phpunit-command.js');

var globalCommand;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async (methodName, runClass) => {
        let command;

        // Options for command class
        const commandOptions = {
            method: methodName,
            runClass,
        };

        if (vscode.workspace.getConfiguration("better-phpunit").get("docker.enable")) {
            command = new DockerPhpUnitCommand(commandOptions);
        } else if (vscode.workspace.getConfiguration("better-phpunit").get("ssh.enable")) {
            command = new RemotePhpUnitCommand(commandOptions);
        } else {
            command = new PhpUnitCommand(commandOptions);
        }

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-suite', async () => {
        let command;

        if (vscode.workspace.getConfiguration("better-phpunit").get("docker.enable")) {
            command = new DockerPhpUnitCommand({ runFullSuite: true });
        } else if (vscode.workspace.getConfiguration("better-phpunit").get("ssh.enable")) {
            command = new RemotePhpUnitCommand({ runFullSuite: true });
        } else {
            command = new PhpUnitCommand({ runFullSuite: true });
        }

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        await runPreviousCommand();
    }));

    disposables.push(vscode.tasks.registerTaskProvider('phpunit', {
        provideTasks: () => {
            return [new vscode.Task(
                { type: "phpunit", task: "run" },
                2,
                "run",
                'phpunit',
                new vscode.ShellExecution(globalCommand.output),
                '$phpunit'
            )];
        }
    }));

    // Register CodeLens provider
	disposables.push(vscode.languages.registerCodeLensProvider({
		language: 'php',
		scheme: 'file'
	}, new CodeLensProvider));

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
