console.log('Cargado fileDBUtils');
const dateUtils = require('../util/dateUtils');
const fs = require('fs');
const rootDB = './fileDB/';

// Una caché para no tener que leer continuamente los ficheros de semanas:
let cacheWeek = [];

const fileDBUtils = {
    getWeek: (weekNumber, useCache, callback) => {
        if (cacheWeek[weekNumber] && useCache) {
            //console.log('Enviando caché de la semana: ' + weekNumber);
            callback(cacheWeek[weekNumber]);
        } else {
            console.log('Leyendo archivo de la semana: ' + weekNumber);
            let filePath = fileDBUtils._getWeekFilePath(weekNumber);
            // Verifica la existencia del archivo
            fs.stat(filePath, (err, stats) => {
                // Si existe
                if (stats) {
                    fs.readFile(filePath, 'utf8', (error, data) => {
                        if (!error) {
                            try {
                                data = JSON.parse(data);
                                cacheWeek[weekNumber] = data;
                                callback(data);
                            } catch (e) {
                                console.error(e.message);
                            }
                        } else {
                            console.error(error.message);
                        }
                    });
                } else { // Si no existe, creo un archivo nuevo
                    fs.writeFile(filePath, '[[],[],[],[],[],[],[]]', 'utf8', (error) => {
                        callback([[], [], [], [], [], [], []]);
                    });
                }
            });
        }

    },
    addRecord: (weekNumber, dayOfWeek, categorieId, userId, callback) => {
        fileDBUtils.getWeek(weekNumber, false, week => {
            // Si ya existen registros para esa categoria y ese dia
            if (week[dayOfWeek].find(registro => registro.categorieId === categorieId)) {
                // Si no existe ya ese usuario en esa categoria y ese dia:
                if (!week[dayOfWeek].find(registro => registro.categorieId === categorieId).users.includes(userId))
                    week[dayOfWeek].find(registro => registro.categorieId === categorieId).users.push(userId);
            } // Si no existe ningun registro para esa categoria ni ese dia
            else
                week[dayOfWeek].push({categorieId: categorieId, users: [userId]});
            let filePath = fileDBUtils._getWeekFilePath(weekNumber);
            fs.writeFile(filePath, JSON.stringify(week), 'utf8', (error) => {
                callback();
                console.log('Limpiando caché de la semana: ' + weekNumber);
                cacheWeek[weekNumber] = undefined; // Vaciar cache
            });
        });
    },
    deleteRecord: (weekNumber, dayOfWeek, categorieId, userId, callback) => {
        fileDBUtils.getWeek(weekNumber, false, week => {
            if (
                // Si ya existen registros para esa categoria y ese dia
                week[dayOfWeek].find(registro => registro.categorieId === categorieId) &&
                // Si el registro es un array (no es undefined)
                Array.isArray(week[dayOfWeek].find(registro => registro.categorieId === categorieId).users)
            ) {
                let userPosition = week[dayOfWeek].find(registro => registro.categorieId === categorieId).users.indexOf(userId);
                // Que exista el usuario que queremos borrar
                if (userPosition !== -1)
                    week[dayOfWeek].find(registro => registro.categorieId === categorieId).users.splice(userPosition, 1);
            }
            let filePath = fileDBUtils._getWeekFilePath(weekNumber);
            fs.writeFile(filePath, JSON.stringify(week), 'utf8', (error) => {
                callback();
                console.log('Limpiando caché de la semana: ' + weekNumber);
                cacheWeek[weekNumber] = undefined; // Vaciar cache
            });
        });
    },
    _getWeekFilePath: weekNumber => rootDB + weekNumber + '.json',
};

module.exports = fileDBUtils;
