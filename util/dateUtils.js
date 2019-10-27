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
        /*let firstMonday = dateFirstMonday.getTime();
        let today = new Date().getTime();
        return Math.trunc(dateUtils._differenceBetween2Days(firstMonday, today) / 7);*/
    },
    _differenceBetween2Days: (first, second) => {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

};

module.exports = dateUtils;
