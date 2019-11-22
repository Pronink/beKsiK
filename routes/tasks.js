const express = require('express');
const router = express.Router();
const fileDBUtils = require('../util/fileDBUtils');

router.get('/read/', function (req, res, next) {
    fileDBUtils.tasks.getAllTasks(true, data => {
        res.send(data);
    });
});

// Create a new Task
router.get('/write/:text/:userId', function (req, res, next) {
    let text = req.params['text'];
    let userId = parseInt(req.params['userId']);
    fileDBUtils.tasks.addTask(text, userId, () => {
        res.send({
            text: text,
            userId: userId
        });
    });
});
router.get('/delete/:taskCreated', function (req, res, next) {
    let taskCreated = parseInt(req.params['taskCreated']);
    fileDBUtils.tasks.deleteTask(taskCreated, () => {
        res.send({
            taskCreated: taskCreated
        });
    });
});

router.get('/record/write/:taskCreated/:userId', function (req, res, next) {
    let taskCreated = parseInt(req.params['taskCreated']);
    let userId = parseInt(req.params['userId']);
    fileDBUtils.tasks.addRecord(taskCreated, userId, () => {
        res.send({
            taskCreated: taskCreated,
            userId: userId
        });
    });
});

router.get('/record/delete/:taskCreated/:userId', function (req, res, next) {
    let taskCreated = parseInt(req.params['taskCreated']);
    let userId = parseInt(req.params['userId']);
    fileDBUtils.tasks.deleteRecord(taskCreated, userId, () => {
        res.send({
            taskCreated: taskCreated,
            userId: userId
        });
    });
});


module.exports = router;
