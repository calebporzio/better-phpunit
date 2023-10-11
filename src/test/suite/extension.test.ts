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

suite("Better PHPUnit Test Suite", function () {
    beforeEach(async () => {
        this.timeout(5000)
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('pestBinary', null);
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
        await vscode.workspace.getConfiguration('better-phpunit').update('pestBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("xmlConfigFilepath", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("suiteSuffix", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
    });

    test("Run file outside of method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.ok(extension.getGlobalCommandInstance().method === undefined);
        });
    });

    test("Run file", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-file');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit') + ' ' + path.join(vscode.workspace.rootPath, '/tests/SampleTest.php')
            );
        });
    });

    test("Run from within first method", async () => {
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

    test("Run from within second method", async () => {
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

    test("Detect filename", async () => {
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

    test("Detect filename with a space", async () => {
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

    test("Detect executable", async () => {
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

    test("Detect executable in sub-directory", async () => {
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

    test("Detect configuration in sub-directory", async () => {
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

    test("Uses configuration found in path supplied in settings", async () => {
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

    test("Check full command", async () => {
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

    test("Run previous", async () => {
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

    test("Run entire suite", async () => {
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

    test("Run entire suite with specified options", async () => {
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

    test("Run with commandSuffix config", async () => {
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

    test("Run with phpunitBinary config", async () => {
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
