const findUp = require('find-up');
const vscode = require('vscode');
const path = require('path');

module.exports = class PhpUnitCommand {
    constructor(options) {
        this.runFullSuite = options !== undefined
            ? options.runFullSuite
            : false;

        this.lastOutput;
    }

    get output() {
        if (this.lastOutput) {
            return this.lastOutput;
        }

        this.lastOutput = this.runFullSuite
            ? `${this.binary}${this.suffix}`
            : `${this.binary} ${this.file} ${this.filter}${this.suffix}`;

        return this.lastOutput;
    }

    get file() {
        return this._normalizePath(vscode.window.activeTextEditor.document.fileName);
    }

    get filter() {
        return this.method ? `--filter '^.*::${this.method}( with data set .*)?$'` : '';
    }

    get suffix() {
        let suffix = vscode.workspace.getConfiguration('better-phpunit').get('commandSuffix');

        return suffix ? ' ' + suffix : ''; // Add a space before the suffix.
    }

    get binary() {
        if (vscode.workspace.getConfiguration('better-phpunit').get('phpunitBinary')) {
            return vscode.workspace.getConfiguration('better-phpunit').get('phpunitBinary')
        }

        // find the closest phpunit.xml file in the project (for projects with multiple "vendor/phpunit"s).
        let phpunitDotXml = findUp.sync('phpunit.xml', { cwd: vscode.window.activeTextEditor.document.fileName });

        let rootDirectory = phpunitDotXml
            ? path.dirname(phpunitDotXml)
            : vscode.workspace.rootPath;

        return this._normalizePath(path.join(rootDirectory, 'vendor', 'bin', 'phpunit'));
    }

    get method() {
        let line = vscode.window.activeTextEditor.selection.active.line;
        let method;

        while (line > 0) {
            const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
            const match = lineText.match(/^\s*(?:public|private|protected)?\s*function\s*(\w+)\s*\(.*$/);
            if (match) {
                method = match[1];
                break;
            }
            line = line - 1;
        }

        return method;
    }

    _normalizePath(path) {
        return path
            .replace(/\\/g, '/') // Convert backslashes from windows paths to forward slashes, otherwise the shell will ignore them.
            .replace(/ /g, '\\ '); // Escape spaces.
    }
}