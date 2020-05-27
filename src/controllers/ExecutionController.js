const FlowInstance = require('../Services/FlowInstance');
const db = require('../models');


module.exports = {
    async one(req, resp){
        const {instanceId} = req.params;

        try {
            const instance = await db.Instance.findById(instanceId)
                .populate("operator", "name")
                .populate({
                    path: "flowId",
                    populate: {path: "phases"}
                })

            return resp.json(instance);
        } catch (error) {
            console.log(error);
            return resp.json({message:error});
        }
    }, 
    async index(req, resp){
        const url = req.url;
        const {status, sortType} = req.params;

        try {
            let query = db.Instance.find()
                .sort({starttime: sortType === "asc"? 1: -1});

            if (url.indexOf('execs/summary') >= 0) {
                query.select(["flowId", "status", "phase", "size", "operator", "starttime", "endtime"])
                    .populate("operator", "name")
                    .populate("flowId", "name");
            }
            if (status) query.where({status});

            const instanceList = await query.exec();
            return resp.json(instanceList);
        } catch (error) {
            console.log(error)
            resp.sendStatus(500);
        }
    },

    async create(req, resp){
        const userId = req.get('user-id');
        const {flowId} = req.params;
        const {host, port, user, pass} = req.body;

        const latentFlow = new FlowInstance(flowId, userId, req.app);
        

        const connectionRet = await latentFlow.connect(user, pass, host, port);
        
        if (!connectionRet) return resp.status(403).json({ret: -1, message:"Could not connect. Check user, pass and ip address."})
        
        
        await latentFlow.build();
        const startRet = await latentFlow.start();
  
        
        return resp.json(latentFlow.instance);
    },

    async remove(req, resp){
        const {flowId} = req.params;
        req.app.locals.flowInstances[flowId] = false;

        try {
            await db.Instance.findOneAndUpdate(
                {status:{$in: ["starting","running"]}, flowId},
                {$set:{status:"stopping"}}
            );
            
            resp.json({ret:0, message:"stop command sent"});

        } catch (error) {
            console.log(error);
            return resp.json({message:error});
        }

        
    }

   
}