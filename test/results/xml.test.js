/* global suite, test */

const expect = require('expect');

const { parseXmlFromString, parseXmlFromFile } = require('../../results/xml');

suite("XML Parsing", function() {
    test("Should be able to parse XML strings", function () {
        const result = parseXmlFromString(`
            <foo key1="1">
                <bar key2="2">baz</bar>
            </foo>
        `)

        return expect(result).resolves.toEqual({
            foo: {
                '$': { key1: '1' },
                bar: [
                    {
                        '$': { key2: '2' },
                        '_': "baz",
                    }
                ]
            }
        })
    });

    test("Should be able to parse XML files", function () {
        const result = parseXmlFromFile(`${__dirname}/../fixtures/output.log.xml`)

        return expect(result).resolves.toBeInstanceOf(Object)
    });
});