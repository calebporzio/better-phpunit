const vscode = require('vscode');
const { Log } = require("./results/Log")

var fileName;
var outputLog;
var filterString;
var lastRanTests;
var ranFromCommand;
var runWithoutCommandCount;

function activate(context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-phpunit.run', async () => {
        fileName = vscode.window.activeTextEditor.document.fileName;
        const methodName = getMethodName(vscode.window.activeTextEditor.selection.active.line);
        filterString = methodName ? `--filter '/^.*::${methodName}$/'` : '';

        ranFromCommand = true;

        console.log("better-phpunit: Running PHPUnit Tests")
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
        await updateLastRanTests()

        setTimeout(() => {
            // This hideous setTimeout is here, because for some reason
            // VS Code runs a task twice instantaniously - ugh.
            ranFromCommand = undefined;
        }, 100);
    }));

    disposables.push(vscode.commands.registerCommand('better-phpunit.run-previous', async () => {
        // throw error if not run yet

        ranFromCommand = true;

        console.log("better-phpunit: Running PHPUnit Tests")
        await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpunit: run');
        await updateLastRanTests()

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

                filterString = getPHPUnitFilters()
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

function getQualifiedClassName(lineNumber) {
    const namespace = getNamespace(lineNumber)
    const className = getClassName(lineNumber)

    if (namespace && className) {
        return `${namespace}\\${className}`
    }
    
    if (className) {
        return className
    }
}

function getNamespace(lineNumber) {
    let line = lineNumber;

    while (line > 0) {
        const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
        const match = lineText.match(/^\s*namespace\s*(\w+)\s*;\s*$/);

        if (match) {
            return match[1];
        }

        line = line - 1;
    }
}

function getClassName(lineNumber) {
    let line = lineNumber;

    while (line > 0) {
        const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
        const match = lineText.match(/^\s*class\s*(\w+)\s*{?\s*$/);

        if (match) {
            return match[1];
        }

        line = line - 1;
    }
}

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

function createFilterString(filter) {
    if (filter.class && filter.method) {
        return `--filter '/^${filter.class}::${filter.method}$/'`
    }

    if (filter.method) {
        return `--filter '/^.*::${filter.method}$/'`
    }
}

function getActiveFileFilters() {
    return [
        {
            file: vscode.window.activeTextEditor.document.fileName,
            class: getQualifiedClassName(vscode.window.activeTextEditor.selection.active.line),
            method: getMethodName(vscode.window.activeTextEditor.selection.active.line),
        }
    ]
}

function getPHPUnitFilters() {
    return getActiveFileFilters().map(createFilterString).join(" ")
}

function buildPHPUnitCommand(rootDirectory, fileName, filterString) {
    const logPath = `${rootDirectory}/.betterphpunit.output.log.xml`
    const readyFile = `${rootDirectory}/.betterphpunit.done`

    outputLog = new Log(logPath, readyFile)

    let command = `${rootDirectory}/vendor/bin/phpunit --colors --log-junit ${outputLog.getPath()} ${filterString}`

    return `${command}; touch ${readyFile}`
}

async function updateLastRanTests() {
    console.log("better-phpunit: Updating Last Run Tests")
    lastRanTests = await getRanTests()
}

async function getRanTests() {
    if (outputLog) {
        console.log("better-phpunit: Waiting for tests to complete")
        await outputLog.waitUntilReady()

        console.log("better-phpunit: Parsing test ouput")
        return await outputLog.getTests()
    }

    console.log("better-phpunit: No output log was set")
    return []
}
