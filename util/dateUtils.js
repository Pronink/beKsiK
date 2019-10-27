console.log('Cargado dateUtils');
// MOMENT
const moment = require('moment');
// OBTENER CONFIG
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/general.json', 'utf8'));
const dateFirstMonday = new Date(config['firstMondayDateYYYY-MM-DD']);

const dateUtils = {
    getCurrentWeekNumber: ()=> {
        let start = moment(dateFirstMonday);
        let end = moment().subtract(1, "days");
        return Math.trunc(end.diff(start, "days") / 7);
    }
};

module.exports = dateUtils;
