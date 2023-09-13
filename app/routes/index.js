const app = require('express')();
app.use('/v1', require('./v1/index'));
// app.use('/v1', require('./v1/user'));
module.exports = app;
