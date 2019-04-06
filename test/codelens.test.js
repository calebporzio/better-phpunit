const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const CodeLensProvider = require('../src/codelens-provider');

describe('CodeLens Tests', function () {
    beforeEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('ssh.enable', false);
        await vscode.workspace.getConfiguration('better-phpunit').update('xmlConfigFilepath', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('suiteSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('docker.enable', false);
        await vscode.workspace.getConfiguration('better-phpunit').update('codelens', true);
    });

    afterEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('ssh.enable', false);
        await vscode.workspace.getConfiguration('better-phpunit').update('xmlConfigFilepath', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('suiteSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('docker.enable', false);
        await vscode.workspace.getConfiguration('better-phpunit').update('codelens', true);
    });

    it('Does not show CodeLens if disabled', async () => {
        // Update settings
        await vscode.workspace.getConfiguration('better-phpunit').update('codelens', false);

        const codeLensProvider = new CodeLensProvider;
        const document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'CodeLensTest.php'));

        // Retrieve fetched test by provider
        const fetchedTests = await codeLensProvider.provideCodeLenses(document);

        assert.strictEqual(fetchedTests.length, 0);
    });

    it('Detect methods with test prefix or decorator', async () => {
        const codeLensProvider = new CodeLensProvider;
        const document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'CodeLensTest.php'));

        // Retrieve fetched test by provider
        const fetchedTests = await codeLensProvider.provideCodeLenses(document);

        assert.strictEqual(fetchedTests.length, 4); // 3 methods + the last one is the class
    });

    it('Allows to run the class tests', async () => {
        const codeLensProvider = new CodeLensProvider;
        const document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'CodeLensTest.php'));

        // Retrieve fetched test by provider
        const fetchedTests = await codeLensProvider.provideCodeLenses(document);

        // Retrieve last, we append class at the end
        const lastCodeLens = fetchedTests[fetchedTests.length - 1];

        assert.strictEqual(fetchedTests.length, 4); // 3 methods + the last one is the class
        assert.strictEqual(lastCodeLens.command.title, codeLensProvider.CLASS_TEST_LABEL);
        assert.ok(lastCodeLens.command.arguments[0] === null);
        assert.ok(lastCodeLens.command.arguments[1]);
    });
});
