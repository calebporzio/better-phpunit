const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
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

describe("Better PHPUnit Test Suite", function () {
    beforeEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("useCodeception", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("xmlConfigFilepath", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("suiteSuffix", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
    });

    afterEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("useCodeception", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("xmlConfigFilepath", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("suiteSuffix", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
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
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
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
                path.join(vscode.workspace.rootPath, '/tests/SampleTest.php')
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
                path.join(vscode.workspace.rootPath, '/tests/FileXX WithXX SpacesXX Test.php')
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
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit')
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
                path.join(vscode.workspace.rootPath, '/sub-directory/vendor/bin/phpunit')
            );
        });
    });

    it("Detect configuration in sub-directory", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().configuration,
                ` --configuration ${path.join(vscode.workspace.rootPath, '/sub-directory/phpunit.xml')}`
            );
        });
    });

    it("Do not detect configuration if using Codeception", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('useCodeception', true);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().configuration,
                ``
            );
        });
    });

    it("Uses configuration found in path supplied in settings", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('xmlConfigFilepath', '/var/log/phpunit.xml');
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().configuration,
                ` --configuration /var/log/phpunit.xml`
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
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit ') + path.join(vscode.workspace.rootPath, '/tests/SampleTest.php') + " --filter '^.*::test_first( .*)?$'"
            );
        });
    });

    it("Check full command using Codeception", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('useCodeception', true);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/codecept run ') + path.join(vscode.workspace.rootPath, '/tests/SampleTest.php') + ":test_first"
            );
        });
    });

    it("Run previous", async () => {
        let prevDocument = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(prevDocument, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'OtherTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(12, 0, 12, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-previous');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit ') + path.join(vscode.workspace.rootPath, '/tests/SampleTest.php') + " --filter '^.*::test_first( .*)?$'"
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
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit')
            );
        });
    });

    it("Run entire suite with Codeception", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('useCodeception', true);
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/codecept run')
            );
        });
    });

    it("Run entire suite with specified options", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('suiteSuffix', '--testsuite unit --coverage');
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit') + ' --testsuite unit --coverage'
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
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit') + ' --foo=bar'
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
