const findUp = require('find-up');
const vscode = require('vscode');
const path = require('path');
const SSH = require("./ssh");

module.exports = class CommandInstance {
    constructor() {
        this.ssh = new SSH();

        this.fileName = this.normalizePath(vscode.window.activeTextEditor.document.fileName);
        this.fileName = this.ssh.remapLocalPath(this.fileName)

        this.methodName = this.findMethodName();

        this.executablePath = vscode.workspace.getConfiguration('better-phpunit').get('phpunitBinary')
            || this.findExecutablePath();
        this.executablePath = this.ssh.remapLocalPath(this.executablePath)

        this.shellCommand = `${this.executablePath} ${this.fileName} ${this.filterString()}${this.commandSuffix()}`;
        this.shellCommand = this.ssh.wrapCommand(this.shellCommand)
    }

    runEntireSuite() {
        this.shellCommand = `${this.executablePath}${this.commandSuffix()}`;
        this.shellCommand = this.ssh.wrapCommand(this.shellCommand)

        return this;
    }

    filterString() {
        return this.methodName ? `--filter '^.*::${this.methodName}$'` : '';
    }

    commandSuffix() {
        let suffix = vscode.workspace.getConfiguration('better-phpunit').get('commandSuffix');
        return suffix ? ' ' + suffix : ''; // Add a space before the suffix.
    }

    findExecutablePath() {
        // find the closest phpunit.xml file in the project (for projects with multiple "vendor/phpunit"s).
        let phpunitDotXml = findUp.sync('phpunit.xml', { cwd: vscode.window.activeTextEditor.document.fileName });

        let rootDirectory = phpunitDotXml
            ? path.dirname(phpunitDotXml)
            : vscode.workspace.rootPath;

        return this.normalizePath(path.join(rootDirectory, 'vendor', 'bin', 'phpunit'));
    }

    findMethodName() {
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

    normalizePath(path) {
        return path
            .replace(/\\/g, '/') // Convert backslashes from windows paths to forward slashes, otherwise the shell will ignore them.
            .replace(/ /g, '\\ '); // Escape spaces.
    }
}