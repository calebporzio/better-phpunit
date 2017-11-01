const { parseXmlFromString, parseXmlFromFile } = require("./xml")

function parseFile(file) {
    return parseXmlFromFile(file).then(output => parseOutput(output))
}

function parseString(str) {
    return parseXmlFromString(str).then(output => parseOutput(output))
}

function statusOfTest(test) {
    const skips = test.skipped || []
    const errors = test.error || []
    const warnings = test.warning || []
    const failures = test.failure || []

    if (failures.length > 0) {
        return "failed"
    }

    if (errors.length > 0) {
        if (errors.every(e => (e["_"] || "").includes("Risky Test"))) {
            return "risky"
        }

        return "failed"
    }

    if (skips.length > 0) {
        return "skipped"
    }

    if (warnings.length > 0) {
        return "warning"
    }

    return "passed"
}

function* testsInSuites(suites) {
    for (let suite of suites) {
        yield* testsInSuite(suite)
    }
}

function* testsInSuite(suite) {
    for (let subsuite of suite.testsuite || []) {
        yield* testsInSuite(subsuite)
    }

    for (let test of suite.testcase || []) {
        console.log("better-phpunit: parsing test", test)

        yield {
            name: test["$"].name,
            status: statusOfTest(test),
            duration: parseFloat(test["$"].time),

            file: test["$"].file,
            class: test["$"].class,
        }
    }
}

function parseOutput(output) {
    console.log("better-phpunit: Parsing output")

    const suites = output.testsuites.testsuite
    
    const tests = []

    for (let test of testsInSuites(suites)) {
        console.log("better-phpunit: found test", test)

        tests.push(test)
    }

    return tests
}

exports.parseFile = parseFile
exports.parseString = parseString
