const fs = require("fs")
var waitOn = require("wait-on");

function waitForFile(path) {
    return waitFor({
        delay: 1000,
        interval: 1000,

        resources: [
            path,
        ],
    })
}

function waitFor(opts) {
    return new Promise(resolve => {
        waitOn(opts, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        });
    })
}

function unlinkFile(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

exports.unlinkFile = unlinkFile
exports.waitForFile = waitForFile