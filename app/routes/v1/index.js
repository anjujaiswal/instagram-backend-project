const app = require('express')();
const { verifyApiKey } = require('../../middleware/auth');

const swaggerRouterV1 = require('./swagger/index');
app.use('/', swaggerRouterV1);
app.use(verifyApiKey);
app.use('/auth', require('./auth'));
app.use('/user', require('./user/user.routes'));
app.use('/admin', require('./admin/admin.routes'));
module.exports = app;
