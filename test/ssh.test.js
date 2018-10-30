const path = require('path');
const assert = require('assert');
const vscode = require('vscode');
const extension = require('../src/extension');
const waitToAssertInSeconds = 5;

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
    beforeEach(async () => {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.disableAllOptions", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.port", "2222");
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);

        const paths = {};
        paths[path.join(vscode.workspace.rootPath)] = "/some/remote/path";
        paths["/some/other_local/path"] = "/some/other_remote/path";
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.paths", paths);
    });

    afterEach(async () => {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.disableAllOptions", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.port", "2222");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.binary", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.paths", {});
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
    });

    it("Commands are not wrapped when SSH is disabled", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit ') + path.join(vscode.workspace.rootPath, '/tests/SampleTest.php') + " --filter '^.*::test_first$'"
        );
    });

    it("The correct SSH command is run when triggering Better PHPUnit", async function () {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh -tt -p2222 auser@ahost "/some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first$\'"'
        );
    });

    it("Can use a custom ssh binary", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.binary", "putty -ssh");

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'putty -ssh -tt -p2222 auser@ahost "/some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first$\'"'
        );
    });

    it("Can disable all ssh config options", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.disableAllOptions", true);

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh "/some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first$\'"'
        );
    });
});
