const vscode = require('vscode');

var fileName;
var filterString;
var ranFromCommand;
var runWithoutCommandCount;

function activate(context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        fileName = vscode.window.activeTextEditor.document.fileName;
        const methodName = getMethodName(vscode.window.activeTextEditor.selection.active.line);
        filterString = methodName ? `--filter '/^.*::${methodName}$/'` : '';

        ranFromCommand = true;

        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');

        setTimeout(() => {
            // This hideous setTimeout is here, because for some reason
            // VS Code runs a task twice instantaniously - ugh.
            ranFromCommand = undefined;
        }, 100);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        // throw error if not run yet

        ranFromCommand = true;

        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');

        setTimeout(() => {
            // This hideous setTimeout is here, because for some reason
            // VS Code runs a task twice instantaniously - ugh.
            ranFromCommand = undefined;
        }, 100);
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: (token) => {
            const rootDirectory = vscode.workspace.rootPath;

            if (! ranFromCommand) {
                fileName = vscode.window.activeTextEditor.document.fileName;
                const methodName = getMethodName(vscode.window.activeTextEditor.selection.active.line);
                filterString = methodName ? `--filter '/^.*::${methodName}$/'` : '';
            }

            const command = buildPHPUnitCommand(rootDirectory, fileName, filterString)

            const tasks = [
                new vscode.Task(
                    { type: "phpunit", task: "run" },
                    "run",
                    'phpunit',
                    new vscode.ShellExecution(command),
                    '$phpunit'
                )
            ];

            return tasks;
        },
        resolveTask(task) {
            return undefined;
        }
    }));

    context.subscriptions.push(disposables);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

function getMethodName(lineNumber) {
    let methodName;
    let line = lineNumber;

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

function buildPHPUnitCommand(rootDirectory, fileName, filterString) {
    let command = `${rootDirectory}/vendor/bin/phpunit --colors ${fileName} ${filterString}`

    return command
}
