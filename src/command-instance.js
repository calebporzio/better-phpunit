const findUp = require('find-up');
const vscode = require('vscode');
const path = require('path');

module.exports = class CommandInstance {
    constructor() {
        this.fileName = this.normalizePath(vscode.window.activeTextEditor.document.fileName);
        this.methodName = this.findMethodName();
        this.executablePath = this.findExecutablePath();

        const filterString = this.methodName ? `--filter '^.*::${this.methodName}$'` : '';
        this.shellCommand = `${this.executablePath} ${this.fileName} ${filterString}`;
    }

    findExecutablePath() {
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