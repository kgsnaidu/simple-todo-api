const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const app = express();
app.use(bodyParser.json());

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

app.listen(3000, () => {
    console.log('Server started on port 3000');
});