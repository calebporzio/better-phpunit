const { Tests } = require("./tests")
const { unlinkFile, waitForFile } = require("./utils")

function Log(path, readyFile) {
    this.path = path
    this.readyFile = readyFile
}

Log.prototype.getPath = function () {
    return this.path
}

Log.prototype.waitUntilReady = async function () {
    await waitForFile(this.readyFile)
    await unlinkFile(this.readyFile)
}

Log.prototype.getTests = async function () {
    console.log("better-phpunit: Loading tests from file")

    const tests = await Tests.fromFile(this.path)

    await this.remove()

    return tests
}

Log.prototype.remove = async function () {
    await unlinkFile(this.path)
}

exports.Log = Log
