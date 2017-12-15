const assert = require('assert');
const vscode = require('vscode');
const SSH = require('../src/ssh');
const waitToAssertInSeconds = 1;

// This is a little helper function to promisify setTimeout, so we can "await" setTimeout.
function timeout(seconds, callback) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve();
        }, seconds * waitToAssertInSeconds);
    });
}

// I'd love for these to be SSH integration tests.
// However, that would take a fair amount of setup.
describe("SSH Tests", function () {
    let originalPlatform;

    beforeEach(async () => {
        this.originalPlatform = process.platform;

        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.paths", {
            "/some/local/path": "/some/remote/path",
            "/some/other_local/path": "/some/other_remote/path",
        });
    });

    afterEach(async () => {
        Object.defineProperty(process, "platform", { value: this.originalPlatform });

        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.paths", {});
    });

    it("Commands are not wrapped when SSH is disabled", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);

        assert.equal("foo", (new SSH).wrapCommand("foo"));
    });

    it("Commands are wrapped when SSH is enabled", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.port", "2222");

        // This test _sometimes_ fails. It might be because
        // the config file isn't written quickly enough.
        // Therefore, we'll wait just in case.
        await timeout(250, () => {});

        assert.equal("ssh -tt -p2222 auser@ahost \"foo\"", (new SSH).wrapCommand("foo"));
    });

    it("On Windows commands are wrapped with putty", async function () {
        Object.defineProperty(process, "platform", { value: "win32" });

        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.port", "2222");

        assert.equal("putty -ssh -tt -p2222 auser@ahost \"foo\"", (new SSH).wrapCommand("foo"));
    });

    it("Paths are not convereted when SSH is disabled", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);

        assert.equal("/some/local/path", (new SSH).remapLocalPath("/some/local/path"));
        assert.equal("/some/other_local/path", (new SSH).remapLocalPath("/some/other_local/path"));
    });

    it("Paths are converted when SSH is enabled", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", true);

        await timeout(250, () => {});

        assert.equal("/some/remote/path", (new SSH).remapLocalPath("/some/local/path"));
        assert.equal("/some/other_remote/path", (new SSH).remapLocalPath("/some/other_local/path"));
    });
});
