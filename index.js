const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const home = require('./routes/home')
const courses = require('./routes/courses');
const express = require('express');

const app = express();

// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(`app get env: ${app.get('env')}`);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use('/', home);
app.use('/api/courses', courses);

// Configuration
startupDebugger('Application Name: ' + config.get('name'));
startupDebugger('Mail Server: ' + config.get('mail.host'));
startupDebugger('Mail Password: ' + config.get('mail.password'));

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    startupDebugger('Morgan enabled...');
}   

app.use(logger);

app.use(function(req, res, next) {
    console.log('Authenticating....');
    next();
});


// DB work
dbDebugger('Connected to the database...');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}....`));