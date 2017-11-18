const vscode = require('vscode');
const assert = require('assert');
const ProjectSnapshot = require('./project-snapshot');

var projectSnapshot;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        projectSnapshot = new ProjectSnapshot;

        await vscode.commands.executeCommand('workbench.action.terminal.clear');
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        if (runCommandHasntRunYet()) {
            vscode.window.showErrorMessage('Better PHPUnit: No tests have been run yet.');
            return;
        }

        await vscode.commands.executeCommand('workbench.action.terminal.clear');
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            if (runCommandHasntRunYet()) {
                return []; // Don't provide task until the "run" command has been run.
            }

            const filterString = projectSnapshot.methodName ? `--filter '^.*::${projectSnapshot.methodName}$'` : '';

            return [new vscode.Task(
                { type: "phpunit", task: "run" },
                "run",
                'phpunit',
                new vscode.ShellExecution(`${projectSnapshot.executablePath} ${projectSnapshot.fileName} ${filterString}`),
                '$phpunit'
            )];
        }
    }));

    context.subscriptions.push(disposables);
}

function runCommandHasntRunYet() {
    return ! projectSnapshot;
}