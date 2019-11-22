const express = require('express');
const router = express.Router();
const dateUtils = require('../util/dateUtils');
const fileDBUtils = require('../util/fileDBUtils');

router.get('/read/:weekNumber?', function (req, res, next) {
    let weekNumber;
    if (req.params['weekNumber'])
        weekNumber = parseInt(req.params['weekNumber']);
    else
        weekNumber = dateUtils.getCurrentWeekNumber();

    fileDBUtils.board.getWeek(weekNumber, true, data => {
        res.send({
            weekData: data,
            weekNumber: weekNumber
        });
    });
});

router.get('/write/:weekNumber/:dayOfWeek/:categorieId/:userId', function (req, res, next) {
    let weekNumber = parseInt(req.params['weekNumber']);
    let dayOfWeek = parseInt(req.params['dayOfWeek']);
    let categorieId = parseInt(req.params['categorieId']);
    let userId = parseInt(req.params['userId']);
    fileDBUtils.board.addRecord(weekNumber, dayOfWeek, categorieId, userId, () => {
        res.send({
            weekNumber: weekNumber,
            dayOfWeek: dayOfWeek,
            categorieId: categorieId,
            userId: userId,
        });
    });
});


router.get('/delete/:weekNumber/:dayOfWeek/:categorieId/:userId', function (req, res, next) {
    let weekNumber = parseInt(req.params['weekNumber']);
    let dayOfWeek = parseInt(req.params['dayOfWeek']);
    let categorieId = parseInt(req.params['categorieId']);
    let userId = parseInt(req.params['userId']);
    fileDBUtils.board.deleteRecord(weekNumber, dayOfWeek, categorieId, userId, () => {
        res.send({
            weekNumber: weekNumber,
            dayOfWeek: dayOfWeek,
            categorieId: categorieId,
            userId: userId,
        });
    });
});


module.exports = router;
