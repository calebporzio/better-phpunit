const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const extension = require('../src/extension');
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

describe("Better PHPUnit Test Suite", function () {
    beforeEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
    });

    afterEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
    });

    it("Run file outside of method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.ok(extension.getGlobalCommandInstance().method === undefined);
        });
    });

    it("Run from within first method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, {selection: new vscode.Range(7, 0, 7, 0)});
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().method,
                'test_first'
            );
        });
    });

    it("Run from within second method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(12, 0, 12, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().method,
                'test_second'
            );
        });
    });

    it("Detect filename", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().file,
                '/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/SampleTest.php'
            );
        });
    });

    it("Detect filename with a space", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'File With Spaces Test.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().file.replace(/\\/g, 'XX'),
                '/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/FileXX WithXX SpacesXX Test.php'
            );
        });
    });

    it("Detect executable", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                '/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit'
            );
        });
    });

    it("Detect executable in sub-directory", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                '/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/sub-directory/vendor/bin/phpunit'
            );
        });
    });

    it("Check full command", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit /Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/SampleTest.php --filter '^.*::test_first$'"
            );
        });
    });

    it("Run previous", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'OtherTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(12, 0, 12, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-previous');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit /Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/SampleTest.php --filter '^.*::test_first$'"
            );
        });
    });

    it("Run entire suite", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit"
            );
        });
    });

    it("Run with commandSuffix config", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', '--foo=bar');

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit --foo=bar"
            );
        });
    });

    it("Run with phpunitBinary config", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', 'vendor/foo/bar');

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "vendor/foo/bar"
            );
        });
    });
});