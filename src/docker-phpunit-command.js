const vscode = require('vscode');
const RemotePhpUnitCommand = require('./remote-phpunit-command');

module.exports = class DockerPhpUnitCommand extends RemotePhpUnitCommand {
    get paths() {
        return this.config.get("docker.paths");
    }

    wrapCommand(command) {
        const container = this.config.get("docker.container");

        return `docker exec ${container} ${command}`;
    }
}
