const { Tests } = require("./tests")
const fs = require("fs")
var waitOn = require("wait-on");

function Log(path, readyFile) {
    this.path = path
    this.readyFile = readyFile
}

Log.prototype.getPath = function () {
    return this.path
}

Log.prototype.waitUntilReady = async function () {
    return new Promise(resolve => {
        const opts = {
            delay: 1000,
            interval: 1000,

            resources: [
                this.readyFile,
            ],
        }

        waitOn(opts, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        });
    })
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
