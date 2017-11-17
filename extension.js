const findUp = require('find-up');
const vscode = require('vscode');
const assert = require('assert');
const path = require('path');

var projectSnapshot;

function activate(context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        projectSnapshot = new ProjectSnapshot;

        await vscode.commands.executeCommand('workbench.action.terminal.clear');
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        if (! projectSnapshot) {
            vscode.window.showErrorMessage('Better PHPUnit: No tests have been run yet.');
            return;
        }

        await vscode.commands.executeCommand('workbench.action.terminal.clear');
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            assert(projectSnapshot);

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
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

function ProjectSnapshot() {
    this.fileName;
    this.methodName;
    this.executablePath;

    this.init();
}

ProjectSnapshot.prototype.init = function () {
    this.fileName = vscode.window.activeTextEditor.document.fileName.replace(/ /g, '\\ ');
    this.methodName = this.findMethodName();
    this.executablePath = this.findExecutablePath(this.fileName);
}

ProjectSnapshot.prototype.findExecutablePath = (currentFileName) => {
    let phpunitDotXml = findUp.sync('phpunit.xml', { cwd: currentFileName });

    if (phpunitDotXml) {
        return path.join(path.dirname(phpunitDotXml), 'vendor', 'bin', 'phpunit');
    }

    let projectDirectory = vscode.workspace.rootPath.replace(/ /g, '\\ ');

    return path.join(projectDirectory, 'vendor', 'bin', 'phpunit');
}

ProjectSnapshot.prototype.findMethodName = () => {
    let line = vscode.window.activeTextEditor.selection.active.line;
    let methodName;

    while (line > 0) {
        const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
        const match = lineText.match(/^\s*(?:public|private|protected)?\s*function\s*(\w+)\s*\(.*$/);
        if (match) {
            methodName = match[1];
            break;
        }
        line = line - 1;
    }

    return methodName;
}