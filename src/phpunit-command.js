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

        let runSuites = vscode.workspace.getConfiguration('better-phpunit').get('runSuites') || "";
        if (runSuites) {
            if (vscode.workspace.getConfiguration('better-phpunit').get('useCodeception')) {
                runSuites = ' '.concat(runSuites.replace(/\s+/g, ''));
            } else {
                runSuites = ' --testsuite '.concat(runSuites.replace(/\s+/g, ''));
            }
        }
        this.lastOutput = this.runFullSuite
            ? `${this.binary}${runSuites}${this.suffix}`
            : `${this.binary} ${this.file}${this.filter}${this.configuration}${this.suffix}`;

        return this.lastOutput;
    }

    get file() {
        return this._normalizePath(vscode.window.activeTextEditor.document.fileName);
    }

    get filter() {
        let filterMethod = process.platform === "win32" ? ` --filter '^.*::${this.method}$'` : ` --filter '^.*::${this.method}( .*)?$'`;
        if (vscode.workspace.getConfiguration('better-phpunit').get('useCodeception')) {
            filterMethod = `:${this.method}`;
        }
        return (this.method ? filterMethod : '');
    }

    get configuration() {
        let configFilepath = vscode.workspace.getConfiguration('better-phpunit').get('xmlConfigFilepath');
        if (configFilepath !== null) {
            return ` --configuration ${configFilepath}`;
        }
        return this.subDirectory
            ? ` --configuration ${this._normalizePath(path.join(this.subDirectory, 'phpunit.xml'))}`
            : '';
    }

    get suffix() {
        let suffix = vscode.workspace.getConfiguration('better-phpunit').get('commandSuffix');

        return suffix ? ' ' + suffix : ''; // Add a space before the suffix.
    }

    get binary() {
        let configuredBinary = vscode.workspace.getConfiguration('better-phpunit').get('phpunitBinary');
        if (configuredBinary) {
            if (vscode.workspace.getConfiguration('better-phpunit').get('useCodeception')) {
                configuredBinary = configuredBinary.concat(' run');
            }
            return configuredBinary;
        }

        return this.subDirectory
            ? this._normalizePath(path.join(this.subDirectory, 'vendor', 'bin', 'phpunit'))
            : this._normalizePath(path.join(vscode.workspace.rootPath, 'vendor', 'bin', 'phpunit'));
    }

    get subDirectory() {
        // find the closest phpunit.xml file in the project (for projects with multiple "vendor/bin/phpunit"s).
        let phpunitDotXml = findUp.sync(['phpunit.xml', 'phpunit.xml.dist'], { cwd: vscode.window.activeTextEditor.document.fileName });

        // when using Codeception there is no phpunit.xml file so we use a dummy to return null
        if (vscode.workspace.getConfiguration('better-phpunit').get('useCodeception')) {
            phpunitDotXml = vscode.workspace.rootPath.concat('/phpunit.xml');
        }

        return path.dirname(phpunitDotXml) !== vscode.workspace.rootPath
            ? path.dirname(phpunitDotXml)
            : null;
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
