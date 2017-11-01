const fs = require("fs")
const xml2js = require("xml2js")

const parser = new xml2js.Parser()

function readFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, function (err, contents) {
            if (err) {
                reject(err)
            } else {
                resolve(contents)
            }
        })
    })
}

function parseXmlFromString(str) {
    return new Promise((resolve, reject) => {
        parser.parseString(str, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

function parseXmlFromFile(file) {
    return readFile(file).then(contents => parseXmlFromString(contents))
}

exports.parseXmlFromString = parseXmlFromString
exports.parseXmlFromFile = parseXmlFromFile
