const Engine = require('php-parser');
const vscode = require('vscode');

class CodeLensProvider {
    constructor ()  {
        this.CLASS_TEST_LABEL = 'Run class tests';
        this.METHOD_TEST_LABEL = 'Run test';
    }

    async provideCodeLenses (document) {
        // Check if CodeLens is disabled by settings
        const enabled = Boolean(vscode.workspace.getConfiguration('better-phpunit').get('codelens'));

        // Stop if CodeLens disabled
        if (!enabled) {
            return [];
        }

        // Parse PHP file
        const parsed = Engine.parseCode(document.getText(), {
            ast: {
                withPositions: true,
            },
            parser: {
                debug: false,
                extractDoc: true,
                suppressErrors: true,
            },
            lexer: {
                all_tokens: false,
                comment_tokens: true,
                mode_eval: false,
                asp_tags: false,
                short_tags: true,
            },
        });

        // CodeLens (aka "Run test" label) to be pushed
        const codeLens = [];

        // Loop over parsed content
        for (let node of parsed.children) {
            let classHasTests = false;

            // Skip if not a class
            if (node.kind !== 'class') {
                continue;
            }

            // Loop over class children
            for (let child of node.body) {
                // Take only methods, it could be also constant and so on
                if (child.kind !== 'method') {
                    continue;
                }

                // Skip if name starts with test and if in the docBlock there is not a @test
                const leadingComments = child.leadingComments || [];
                const hasTestAnnotation = leadingComments.find(comment => {
                    return comment.kind === 'commentblock' && comment.value.indexOf('* @test') > -1;
                });

                if (!child.name.name.startsWith('test') && !hasTestAnnotation) {
                    continue;
                }

                // Set true the fact that the current class has tests
                classHasTests = true;

                // Build range for the method (where to put the CodeLens)
                const codeLensRange = new vscode.Range(child.loc.start.line - 1, 0, child.loc.start.line - 1, 0);

                // Append CodeLens
                codeLens.push(new vscode.CodeLens(codeLensRange, {
                    command: 'better-phpunit.run',
                    title: this.METHOD_TEST_LABEL,
                    arguments: [child.name.name, false], // Method name, run whole class
                }));
            } // node.body

            // If class has tests, attach the CodeLens to run the whole class
            if (classHasTests) {
                const classCodeLensRange = new vscode.Range(node.loc.start.line - 1, 0, node.loc.start.line - 1, 0);
                codeLens.push(new vscode.CodeLens(classCodeLensRange, {
                    command: 'better-phpunit.run',
                    title: this.CLASS_TEST_LABEL,
                    arguments: [null, true], // Method name, run whole class
                }));
            }
        } // parse.children

        return codeLens;
    }
}

module.exports = CodeLensProvider;