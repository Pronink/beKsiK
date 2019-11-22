console.log('Cargado fileDBUtils');
const dateUtils = require('../util/dateUtils');
const fs = require('fs');
const rootDBBoard = './fileDB/board/';
const rootDBTasks = './fileDB/tasks/';

// Una caché para no tener que leer continuamente los ficheros de semanas:
let cacheWeek = [];
let cacheTasks = undefined;

const fileDBUtils = {
    board: {
        getWeek: (weekNumber, useCache, callback) => {
            if (cacheWeek[weekNumber] && useCache) {
                //console.log('Enviando caché de la semana: ' + weekNumber);
                callback(cacheWeek[weekNumber]);
            } else {
                console.log('Leyendo archivo de la semana: ' + weekNumber);
                let filePath = fileDBUtils.board._getWeekFilePath(weekNumber);
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
                            if (!error) {
                                callback([[], [], [], [], [], [], []]);
                            } else {
                                console.error(error.message);
                            }
                        });
                    }
                });
            }
        },
        addRecord: (weekNumber, dayOfWeek, categorieId, userId, callback) => {
            fileDBUtils.board.getWeek(weekNumber, false, week => {
                // Si ya existen registros para esa categoria y ese dia
                if (week[dayOfWeek].find(registro => registro.categorieId === categorieId)) {
                    // Si no existe ya ese usuario en esa categoria y ese dia:
                    if (!week[dayOfWeek].find(registro => registro.categorieId === categorieId).users.includes(userId))
                        week[dayOfWeek].find(registro => registro.categorieId === categorieId).users.push(userId);
                } // Si no existe ningun registro para esa categoria ni ese dia
                else
                    week[dayOfWeek].push({categorieId: categorieId, users: [userId]});
                fileDBUtils.board._updateWeek(week, weekNumber, callback);
            });
        },
        deleteRecord: (weekNumber, dayOfWeek, categorieId, userId, callback) => {
            fileDBUtils.board.getWeek(weekNumber, false, week => {
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
                fileDBUtils.board._updateWeek(week, weekNumber, callback);
            });
        },
        _updateWeek: (weekData, weekNumber, callback) => {
            let filePath = fileDBUtils.board._getWeekFilePath(weekNumber);
            fs.writeFile(filePath, JSON.stringify(weekData), 'utf8', (error) => {
                if (!error) {
                    callback();
                    console.log('Limpiando caché de la semana: ' + weekNumber);
                    cacheWeek[weekNumber] = undefined; // Vaciar cache
                } else {
                    console.error(error.message);
                }
            });
        },
        _getWeekFilePath: weekNumber => rootDBBoard + weekNumber + '.json'
    },
    tasks: {
        getAllTasks: (useCache, callback) => {
            if (cacheTasks && useCache) {
                //console.log('Enviando caché de las tareas activas: ' + weekNumber);
                callback(cacheTasks);
            } else {
                console.log('Leyendo archivo de tareas');
                let filePath = fileDBUtils.tasks._getTasksFilePath();
                // Verifica la existencia del archivo
                fs.stat(filePath, (err, stats) => {
                    // Si existe
                    if (stats) {
                        fs.readFile(filePath, 'utf8', (error, data) => {
                            if (!error) {
                                try {
                                    data = JSON.parse(data);
                                    cacheTasks = data;
                                    callback(data);
                                } catch (e) {
                                    console.error(e.message);
                                    console.error('¿Empty tasks.json file?');
                                    callback([]);
                                }
                            } else {
                                console.error(error.message);
                            }
                        });
                    } else { // Si no existe, creo un archivo nuevo
                        fs.writeFile(filePath, '[]', 'utf8', (error) => {
                            if (!error) {
                                callback([]);
                            } else {
                                console.error(error.message);
                            }
                        });
                    }
                });
            }
        },
        addTask: (text, userId, callback) => {
            fileDBUtils.tasks.getAllTasks(false, tasks => {
                tasks.unshift({
                    created: new Date().getTime(),
                    text: text,
                    users: []
                });
                fileDBUtils.tasks._updateTasks(tasks, callback);
            });
        },
        deleteTask(taskCreated, callback) {
            fileDBUtils.tasks.getAllTasks(false, tasks => {
                tasks = tasks.filter(task => task.created !== taskCreated);
                fileDBUtils.tasks._updateTasks(tasks, callback);
            });
        },
        addRecord: (taskCreated, newUserId, callback) => {
            fileDBUtils.tasks.getAllTasks(false, tasks => {
                // Si ya existen registros para esa tarea
                if (tasks.find(task => task.created === taskCreated)) {
                    // Si no existe ya ese usuario en esa categoria y ese dia:
                    if (!tasks.find(task => task.created === taskCreated).users.includes(newUserId))
                        tasks.find(task => task.created === taskCreated).users.push(newUserId);
                } // Si no existe ningun registro para esa tarea
                else
                    tasks.push(newUserId);
                fileDBUtils.tasks._updateTasks(tasks, callback);
            });
        },
        deleteRecord: (taskCreated, userId, callback) => {
            fileDBUtils.tasks.getAllTasks(false, tasks => {
                if (
                    // Si ya existen registros para esa tarea
                    tasks.find(task => task.created === taskCreated) &&
                    // Si el registro es un array (no es undefined)
                    Array.isArray(tasks.find(task => task.created === taskCreated).users)
                ) {
                    let userPosition = tasks.find(task => task.created === taskCreated).users.indexOf(userId);
                    // Que exista el usuario que queremos borrar
                    if (userPosition !== -1)
                        tasks.find(task => task.created === taskCreated).users.splice(userPosition, 1);
                }
                fileDBUtils.tasks._updateTasks(tasks, callback);
            });
        },
        _updateTasks: (tasks, callback) => {
            let filePath = fileDBUtils.tasks._getTasksFilePath();
            fs.writeFile(filePath, JSON.stringify(tasks), 'utf8', (error) => {
                if (!error) {
                    callback();
                    console.log('Limpiando caché de las tareas');
                    cacheTasks = undefined; // Vaciar cache
                } else {
                    console.error(error.message);
                }
            });
        },
        _getTasksFilePath: () => rootDBTasks + 'tasks.json',
    }
};

module.exports = fileDBUtils;
