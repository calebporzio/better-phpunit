const { Tests } = require("./tests")
const fs = require("fs")

function Log(path) {
    this.path = path
}

Log.prototype.getPath = function () {
    return this.path
}

Log.prototype.getTests = async function () {
    const tests = await Tests.fromFile(this.path)

    await this.remove()

    return tests
}

Log.prototype.remove = async function () {
    return new Promise((resolve, reject) => {
        fs.unlink(this.path, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

exports.Log = Log
