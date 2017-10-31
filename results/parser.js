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
    const failures = test.failure || []

    if (failures.length > 0) {
        return "failed"
    }

    if (errors.length > 0) {
        return "failed"
    }

    if (skips.length > 0) {
        return "skipped"
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
        yield {
            name: test["$"].name,
            status: statusOfTest(test),
            duration: parseFloat(test["$"].time),
        }
    }
}

function parseOutput(output) {
    const suites = output.testsuites.testsuite
    
    const tests = []

    for (let test of testsInSuites(suites)) {
        tests.push(test)
    }

    return tests
}

exports.parseFile = parseFile
exports.parseString = parseString
