const vscode = require('vscode');
const RemotePhpUnitCommand = require('./remote-phpunit-command');

module.exports = class DockerPhpUnitCommand extends RemotePhpUnitCommand {
    get paths() {
        return this.config.get("docker.paths");
    }

    get remotePath() {
        for (const [localPath, remotePath] of Object.entries(this.paths)) {
            if (!remotePath.endsWith('/')) {
                return remotePath + '/';
            }
            return remotePath;
        }
    }

    get xmlConfigFileName() {
        if (this.config.get("xmlConfigFileName")) {
            return this.config.get("xmlConfigFileName");
        } 

        return 'phpunit.xml';
    }

    get configuration() {
        return ' --configuration ' + this._normalizePath(this.remotePath) + `${this.xmlConfigFileName}`;
    }

    get dockerCommand() {
        if (this.config.get("docker.command")) {
            return this.config.get("docker.command");
        }

        const msg = "No better-phpunit.docker.command was specified in the settings";
        vscode.window.showErrorMessage(msg);

        throw msg;
    }

    wrapCommand(command) {
        var runCommand = `${this.dockerCommand}`;
        runCommand += `${this.configuration}`;
        runCommand += ' ' + `${this.file}`;
        if (this.filter) {
            runCommand += ' ' + `${this.filter}`;
        }

        return runCommand;
    }
} 
