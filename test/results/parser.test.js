/* global suite, test */

const expect = require('expect');

const { parseString } = require('../../results/parser');

suite("Test Output Parsing", function() {
    test("Should be able to parse PHPUnit test output", function () {
        const result = parseString(`
            <testsuites>
                <!-- Single Suite -->
                <testsuite name="Outer Single">
                    <testcase name="i_pass" class="Tests\\Feature\\TestFile" file="/Users/user/Code/tests/Feature/TestFile.php" line="14" assertions="3" time="1.5"/>
                    <testcase name="i_failed" class="Tests\\Feature\\TestFile" file="/Users/user/Code/tests/Feature/TestFile.php" line="14" assertions="3" time="1.5">
                        <failure type="PHPUnit\\Framework\\ExpectationFailedException">
                            Tests\\Feature\\TestFile::i_failed

                            Failed asserting that false is true.

                            /Users/user/Code/tests/Feature/TestFile.php:14
                        </failure>
                    </testcase>
                </testsuite>

                <!-- Nested Suites -->
                <testsuite name="Outer Nested">
                    <testsuite name="Inner Nested 1">
                        <testcase name="i_pass" class="Tests\\Feature\\TestFile" file="/Users/user/Code/tests/Feature/TestFile.php" line="14" assertions="3" time="1.5"/>
                        <testcase name="i_pass" class="Tests\\Feature\\TestFile" file="/Users/user/Code/tests/Feature/TestFile.php" line="14" assertions="3" time="1.5"/>
                    </testsuite>
                    <testsuite name="Inner Nested 2">
                        <testcase name="i_pass" class="Tests\\Feature\\TestFile" file="/Users/user/Code/tests/Feature/TestFile.php" line="14" assertions="3" time="1.5"/>
                        <testcase name="i_pass" class="Tests\\Feature\\TestFile" file="/Users/user/Code/tests/Feature/TestFile.php" line="14" assertions="3" time="1.5"/>
                    </testsuite>
                </testsuite>
            </testsuites>
        `)

        return expect(result).resolves.toEqual([
            {
                name: "i_pass",
                duration: 1.5,
                status: "passed",
            },
            {
                name: "i_failed",
                duration: 1.5,
                status: "failed",
            },
            {
                name: "i_pass",
                duration: 1.5,
                status: "passed",
            },
            {
                name: "i_pass",
                duration: 1.5,
                status: "passed",
            },
            {
                name: "i_pass",
                duration: 1.5,
                status: "passed",
            },
            {
                name: "i_pass",
                duration: 1.5,
                status: "passed",
            },
        ])
    });
});
