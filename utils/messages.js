const moment = require('moment');

function formatMessage(username, gender, msg) {
    return {
        username,
        gender,
        msg,
        time: moment().format("h:mm a")
    }
}

module.exports = formatMessage;