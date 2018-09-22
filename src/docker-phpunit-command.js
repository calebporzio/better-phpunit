const vscode = require('vscode');
const RemotePhpUnitCommand = require('./remote-phpunit-command');

module.exports = class DockerPhpUnitCommand extends RemotePhpUnitCommand {
    get paths() {
        return this.config.get("docker.paths");
    }

    get dockerBinary() {
        if (this.config.get("docker.binary")) {
            return this.config.get("docker.binary");
        }

        return "docker";
    }

    wrapCommand(command) {
        const container = this.config.get("docker.container");

        return `${this.dockerBinary} exec ${container} ${command}`;
    }
}