const vscode = require('vscode');

module.exports = class SSH {
    constructor() {
        this.config = vscode.workspace.getConfiguration("better-phpunit")
    }

    get enabled() {
        return this.config.get("ssh.enable")
    }
    
    get paths() {
        return this.enabled
            ? this.config.get("ssh.paths")
            : {}
    }

    get isRunningOnWindows() {
        return /^win/.test(process.platform)
    }

    get binary() {
        if (this.isRunningOnWindows) {
            return "putty -ssh"
        }

        return "ssh"
    }

    remapLocalPath(path) {
        for (const [localPath, remotePath] of Object.entries(this.paths)) {
            if (path.startsWith(localPath)) {
                return path.replace(localPath, remotePath)
            }
        }

        return path
    }

    wrapCommand(command) {
        if (! this.enabled) {
            return command
        }

        const user = this.config.get("ssh.user")
        const port = this.config.get("ssh.port")
        const host = this.config.get("ssh.host")

        return `${this.binary} -tt -p${port} ${user}@${host} "${command}"`
    }
}
