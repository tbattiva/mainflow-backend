const {Router} = require('express');
const FlowController = require('./controllers/FlowController');
const UserController = require('./controllers/UserController');
const PhaseController = require('./controllers/PhaseController');
const HostController = require('./controllers/HostController');
const ExecutionController = require('./controllers/ExecutionController');
const SessionController = require('./controllers/SessionController');

const routes = Router();

routes.get('/', (req, resp) => {
    resp.send({message:"Welcome to Mainflow!"});
});

routes.get('/set', (req, resp) => {
    const teste = "t"
    app.locals.flowInstances[teste] = 'kndslksnd';
    resp.send({message:`${app.locals.flowInstances['t']}`});
});

routes.get('/get', (req, resp) => {
    const teste = "t"
    resp.send({message:`${app.locals.flowInstances[teste]}`});
});

routes.post('/sessions', SessionController.index);

routes.post('/hosts', HostController.store);
routes.delete('/hosts/:hostId', HostController.delete);
routes.put('/hosts/:hostId', HostController.update);
routes.get('/hosts/', HostController.indexByUser);

routes.get('/flows/', FlowController.index);
routes.get('/flows/:id', FlowController.open);
routes.post('/flows', FlowController.store);
routes.delete('/flows/:flowId', FlowController.delete);
routes.put('/flows/:flowId', FlowController.update);
routes.get('/flows/check/:flowId', FlowController.check);

routes.post('/flows/:flowId/phases', PhaseController.store);
routes.delete('/flows/:flowId/phases/:phaseId', PhaseController.delete);
routes.put('/flows/:flowId/phases/:phaseId', PhaseController.update);

routes.post('/flows/:flowId/start', ExecutionController.create);
routes.delete('/flows/:flowId/stop', ExecutionController.remove);

routes.get('/execs/get/:instanceId/', ExecutionController.one);
routes.get('/execs/summary/:sortType/:status', ExecutionController.index);
routes.get('/execs/summary/:sortType/', ExecutionController.index);
routes.get('/execs/:sortType/:status', ExecutionController.index);
routes.get('/execs/:sortType/', ExecutionController.index);
routes.get('/execs/', ExecutionController.index);

routes.post('/users', UserController.store);
routes.delete('/users/:userId', UserController.delete);

// routes.get('/tmp', (req, resp) => {
//     req.route
//     return resp.sendDate();
// })

module.exports = routes;