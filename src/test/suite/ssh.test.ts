import * as assert from 'assert';
import { beforeEach, afterEach } from 'mocha';
import * as path from 'path';

const vscode = require('vscode');
const extension = require('../../../src/extension');

const waitToAssertInSeconds = 5;

// This is a little helper function to promisify setTimeout, so we can "await" setTimeout.
function timeout(seconds: any, callback: any) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve('');
        }, seconds * waitToAssertInSeconds);
    });
}

// I'd love for these to be SSH integration tests.
// However, that would take a fair amount of setup.
suite("SSH Tests", function () {
    beforeEach(async () => {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.disableAllOptions", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.port", "2222");
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.command", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.paths", null);

        const paths: any = {};
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
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.command", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.paths", null);
    });

    test("Commands are not wrapped when SSH is disabled", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);

        console.log(vscode.workspace)
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit ') + path.join(vscode.workspace.rootPath, '/tests/SampleTest.php') + " --filter '^.*::test_first( .*)?$'"
        );
    });

    test("The correct SSH command is run when triggering Better PHPUnit", async function () {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh -tt -p2222 auser@ahost "/some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first( .*)?$\'"'
        );
    });

    test("The correct Docker command is run when triggering Better PHPUnit", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.command", "docker exec CONTAINER");
        const paths: any = {};
        paths[path.join(vscode.workspace.rootPath)] = "/some/remote/path";
        paths["/some/other_local/path"] = "/some/other_remote/path";
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.paths", paths);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'docker exec CONTAINER /some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first( .*)?$\''
        );
    });

    test("The correct Docker suite command is run when triggering Better PHPUnit", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.command", "docker exec CONTAINER");
        const paths: any = {};
        paths[path.join(vscode.workspace.rootPath)] = "/some/remote/path";
        paths["/some/other_local/path"] = "/some/other_remote/path";
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.paths", paths);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'docker exec CONTAINER /some/remote/path/vendor/bin/phpunit'
        );
    });

    test("The correct Docker command is run via SSH when triggering Better PHPUnit", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.command", "docker exec CONTAINER");
        const paths: any = {};
        paths[path.join(vscode.workspace.rootPath)] = "/some/remote/path";
        paths["/some/other_local/path"] = "/some/other_remote/path";
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.paths", paths);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh -tt -p2222 auser@ahost "docker exec CONTAINER /some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first( .*)?$\'"'
        );
    });

    test("The correct Docker suite command is run via SSH when triggering Better PHPUnit", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", true);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.command", "docker exec CONTAINER");
        const paths: any = {};
        paths[path.join(vscode.workspace.rootPath)] = "/some/remote/path";
        paths["/some/other_local/path"] = "/some/other_remote/path";
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.paths", paths);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh -tt -p2222 auser@ahost "docker exec CONTAINER /some/remote/path/vendor/bin/phpunit"'
        );
    });

    test("Can use a custom ssh binary", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.binary", "putty -ssh");

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'putty -ssh -tt -p2222 auser@ahost "/some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first( .*)?$\'"'
        );
    });

    test("Can disable all ssh config options", async function () {
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.disableAllOptions", true);

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh "/some/remote/path/vendor/bin/phpunit /some/remote/path/tests/SampleTest.php --filter \'^.*::test_first( .*)?$\'"'
        );
    });
});
