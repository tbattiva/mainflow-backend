const FlowInstance = require('../Services/FlowInstance');


module.exports = {
    async create(req, resp){
        const userId = req.get('user-id');
        const {flowId} = req.params;
        const {host, port, user, pass} = req.body;

        const latentFlow = new FlowInstance(flowId, userId);
        

        const connectionRet = await latentFlow.connect(user, pass, host, port);
        
        if (!connectionRet) return resp.status(403).json({ret: -1, message:"Could not connect. Check user, pass and ip address."})
        
        
        await latentFlow.build();
        const startRet = await latentFlow.start();
  
        
        return resp.json(latentFlow.instance);
    },

    remove(req, resp){
        const {flowId} = req.params;
        app.locals.flowInstances[flowId] = false;

        resp.json({ret:0, message:"stop command sent"});
    }

   
}