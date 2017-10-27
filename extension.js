const vscode = require('vscode');

function activate(context) {

    let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        vscode.window.showInformationMessage('Hello World!');
    });

    let provider = vscode.workspace.registerTaskProvider('phpunit', {
        provideTasks: () => {
            const rootDirectory = vscode.workspace.rootPath;
            const fileName = vscode.window.activeTextEditor.document.fileName;
            const methodName = getMethodName(vscode.window.activeTextEditor.selection.active.line);

            return [
                new vscode.Task(
                    {type: "phpunit", task: "file"},
                    "file",
                    'phpunit',
                    new vscode.ShellExecution(`${rootDirectory}/vendor/bin/phpunit ${fileName}`),
                    '$phpunit'
                ),
                new vscode.Task(
                    { type: "phpunit", task: "method" },
                    "method",
                    'phpunit',
                    new vscode.ShellExecution(`${rootDirectory}/vendor/bin/phpunit ${fileName} --filter ${methodName}`),
                    '$phpunit'
                ),
            ];
        },
        resolveTask(task) {
            return undefined;
        }
    });

    context.subscriptions.push([disposable, provider]);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

function getMethodName(lineNumber) {
    let methodName = '';
    let line = lineNumber;

    while (line > 0) {
        const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
        const methodMatch = lineText.match(/^.*function\s*(.*)\(/);
        const classMatch = lineText.match(/^.*class\s*(\w*)\s*.*$/);
        if (methodMatch || classMatch) {
            const match = methodMatch || classMatch;
            methodName = match[1];
            break;
        }
        line = line - 1;
    }

    return methodName;
}