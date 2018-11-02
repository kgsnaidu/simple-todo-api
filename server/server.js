const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _pick = require('lodash/pick');
const _isBoolean= require('lodash/isBoolean');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

/**
 * Todo api calls
 */

app.post('/todos', (req, res) => {
    new Todo({
        text: req.body.text,
    })
    .save()
    .then(todo => res.send(todo))
    .catch(err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
    Todo.find()
    .then(todos => res.send({ todos }))
    .catch(err => res.status(400).send(err));
})

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(404).send();
    Todo.findById(id)
    .then(todo => {
        if(!todo) return res.status(404).send();
        res.send(todo);
    })
    .catch(err => res.status(400).send(err));
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(404).send();
    Todo.findByIdAndRemove(id)
    .then(todo => {
        if(!todo) return res.status(404).send();
        res.send({ todo })
    })
    .catch(err => res.send(400).send(err));
});

app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = _pick(req.body, ['text', 'completed']);

    if(_isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
        if(!todo) return res.status(404).send();
        res.send({ todo });
    })
    .catch(err => res.status(400).send(err));
});

/**
 * User api calls
 */

app.post('/users', (req, res) => {
    const body = _pick(req.body, ['email', 'password']);
    const user = new User(body);
    
    user.save()
    .then(user => user.generateAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(err => res.status(400).send(err));
});



app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});