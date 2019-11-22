// IMPORTAR EXPRESS
const express = require('express');
const app = express();

// OBTENER CONFIG
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/general.json', 'utf8'));

// CREAR SERVER Y ESCUCHAR
const http = require('http');
const server = http.createServer(app);
server.listen(config['port']);
server.on('error', onError);
server.on('listening', ()=>console.log('Escuchando en el puerto ' + config['port']));

// MIDDLEWARES
const cors = require('cors');
app.use(cors());
const logger = require('morgan');
app.use(logger(':method :url :status :response-time ms :user-agent'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// MIDDLEWARE PETICIONES/SEGUNDO
/*let peticiones = 0;
app.get('*', function (req, res, next){
    peticiones++;
    next();
});
setInterval(()=>{
    console.log('Peticiones/segundo: ' + peticiones);
    peticiones = 0;
}, 1000);*/

// ROUTES
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/week', require('./routes/week'));
app.use('/tasks', require('./routes/tasks'));
app.use('/categories', require('./routes/categories'));

//module.exports = app;

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
