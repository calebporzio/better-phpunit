const vscode = require('vscode');
const PhpUnitCommand = require('./phpunit-command');
const path = require('path');

module.exports = class CodeCeptionCommand extends PhpUnitCommand {
    constructor(options) {
        super(options);

        this.config = vscode.workspace.getConfiguration("better-phpunit");
    }

    get filter() {
        if (this.config.get('useCodeception')) {
            return `:${this.method}`;
        }

        return super.filter;
    }

    get binary() {
        if (this.config.get('useCodeception')) {
            let addCommandOption = ' run';
            let configuredBinary = this.config.get('phpunitBinary');
            if (configuredBinary) {
                return configuredBinary.concat(addCommandOption);
            }
            let commandStub = path.join('vendor', 'bin', 'codecept' + this.windowsSuffix);
            return this.subDirectory
                ? this._normalizePath(path.join(this.subDirectory, commandStub)).concat(addCommandOption)
                : this._normalizePath(path.join(vscode.workspace.rootPath, commandStub)).concat(addCommandOption);
        }

        return super.binary;
    }

    get subDirectory() {
        if (this.config.get('useCodeception')) {
            // when using Codeception there is no phpunit.xml file so we return null
            return null;
        }

        return super.subDirectory;
    }
}
