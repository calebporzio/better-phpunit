const vscode = require('vscode');
const RemotePhpUnitCommand = require('./remote-phpunit-command');

module.exports = class DockerPhpUnitCommand extends RemotePhpUnitCommand {
    get paths() {
        return this.config.get("docker.paths");
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
        return `${this.dockerCommand} ${command}`;
    }
} 