module.exports.getFilter = function (method) {

    return method ? `--filter '${method}'` : '';
}