const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const Joi = require('joi');
const logger = require('./logger');
const express = require('express');

const app = express();

// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(`app get env: ${app.get('env')}`);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

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

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
]

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course){
        res.status(404).send('The course with the given ID was not found.');
    }
    res.send(course);
});

// app.get('/api/posts/:year/:month', (req, res) => {
//     res.send(req.params);
//     // res.send(req.query);
// });

app.post('/api/courses', (req, res) =>{
    // const schema = Joi.object({
    //     name: Joi.string().min(3).required()
    // });

    // const result = schema.validate(req.body);

    // if(!req.body.name || req.body.name.length < 3){
    //     res.status(400).send('Name is required and should be minimum 3 characters.');
    //     return;
    // }

    const { error } = validateCourse(req.body);

    if(error){
        return res.status(400).send(error.details[0].message);
    }

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course){
        return res.status(404).send('The course with the given ID was not found.');
    };

    const { error } = validateCourse(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }

    course.name = req.body.name;
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course){
        return res.status(404).send('The course with the given ID was not found.');
    };

    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
});

function validateCourse(course){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(course);
}

// DB work
dbDebugger('Connected to the database...');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}....`));