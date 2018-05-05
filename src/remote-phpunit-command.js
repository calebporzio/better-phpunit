const vscode = require('vscode');
const PhpUnitCommand = require('./phpunit-command');
const path = require('path');

module.exports = class RemotePhpUnitCommand extends PhpUnitCommand {
    constructor(options) {
        super(options);

        this.config = vscode.workspace.getConfiguration("better-phpunit");
    }

    get configuration() {
        return this.subDirectory
            ? ` --configuration ${this.remapLocalPath(this._normalizePath(path.join(this.subDirectory, 'phpunit.xml')))}`
            : '';
    }

    get file() {
        return this.remapLocalPath(super.file);
    }

    get binary() {
        return this.remapLocalPath(super.binary)
    }

    get output() {
        return this.wrapCommand(super.output);
    }

    get paths() {
        return this.config.get("ssh.paths");
    }

    get sshBinary() {
        if (this.config.get("ssh.binary")) {
            return this.config.get("ssh.binary");
        }

        return "ssh";
    }

    remapLocalPath(actualPath) {
        for (const [localPath, remotePath] of Object.entries(this.paths)) {
            if (actualPath.startsWith(localPath)) {
                return actualPath.replace(localPath, remotePath);
            }
        }

        return actualPath;
    }

    wrapCommand(command) {
        const user = this.config.get("ssh.user");
        const port = this.config.get("ssh.port");
        const host = this.config.get("ssh.host");

        return `${this.sshBinary} -tt -p${port} ${user}@${host} "${command}"`;
    }
}
