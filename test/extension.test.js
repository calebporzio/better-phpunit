const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const extension = require('../src/extension');

suite("Better PHPUnit Test Suite", function() {

    test("Run file outside of method", function (done) {
        this.timeout(8000);
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.ok(extension.getCurrentCommandInstance().methodName === undefined);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Run from within first method", function(done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document, {selection: new vscode.Range(7, 0, 7, 0)}).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal('test_first', extension.getCurrentCommandInstance().methodName);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Run from within second method", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document, { selection: new vscode.Range(12, 0, 12, 0) }).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal('test_second', extension.getCurrentCommandInstance().methodName);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Detect filename", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal('/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/SampleTest.php', extension.getCurrentCommandInstance().fileName);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Detect filename with a space", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'File With Spaces Test.php'))
            .then((document) => {
                vscode.window.showTextDocument(document).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal('/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/FileXX WithXX SpacesXX Test.php', extension.getCurrentCommandInstance().fileName.replace(/\\/g, 'XX'));
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Detect executable", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal('/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit', extension.getCurrentCommandInstance().executablePath);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Detect executable in sub-directory", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal('/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/sub-directory/vendor/bin/phpunit', extension.getCurrentCommandInstance().executablePath);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Full command", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SampleTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) }).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run').then(() => {
                        setTimeout(() => {
                            assert.equal("/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit /Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/SampleTest.php --filter '^.*::test_first$'", extension.getCurrentCommandInstance().shellCommand);
                            done();
                        }, 1000);
                    });
                });
            });
    });

    test("Run previous", function (done) {
        vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'OtherTest.php'))
            .then((document) => {
                vscode.window.showTextDocument(document, { selection: new vscode.Range(12, 0, 12, 0) }).then(() => {
                    vscode.commands.executeCommand('better-phpunit.run-previous').then(() => {
                        setTimeout(() => {
                            assert.equal("/Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/vendor/bin/phpunit /Users/calebporzio/Documents/Code/sites/better-phpunit/test/project-stub/tests/SampleTest.php --filter '^.*::test_first$'", extension.getCurrentCommandInstance().shellCommand);
                            done();
                        }, 1000);
                    });
                });
            });
    });
});