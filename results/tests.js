const { parseFile } = require("./parser")

function Tests(tests) {
    this.tests = tests
}

Tests.fromFile = async function (file) {
    const tests = await parseFile(file)

    return new Tests(tests)
}

Tests.prototype.failed = function () {
    return this.tests.filter(test => test.status === "failed")
}

exports.Tests = Tests
