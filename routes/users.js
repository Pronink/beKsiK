const express = require('express');
const router = express.Router();
const fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  fs.readFile('./config/users.json', 'utf8', (error, data)=>{
    res.send(JSON.parse(data));
  });
});

module.exports = router;
