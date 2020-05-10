const db = require('../models');

module.exports = {
    index(){

    },

    async indexByUser(req, resp){
        const userId = req.get('user-id');
        try {
            const hosts = await db.Host.find({author: userId})
                .populate("author", "name -_id");

            resp.json(hosts);
        } catch (error) {
            return resp.status(500).json({ret: -1, message: error.message});
        }
        
    },

    async store(req, resp){
        const author = req.get('user-id');
        const { name, description, ip, port } = req.body;
        
        try {
            const hostAdded = await db.Host.create({
                name,
                description,
                ip,
                port,
                author,
                creation: Date.now(),
                modified: Date.now(),
    
            });

            return resp.json(hostAdded);
            
        } catch (error) {
            return resp.status(500).json({ret:-1, message:"Error"})
        }
        
        
    },

    async delete(req, resp){
        const {hostId} = req.params;

        try {
            
            const deleteOp = await db.Host.deleteOne({"_id": hostId});
            return resp.json(deleteOp);
        } catch (error) {
            
            if(error.name === "CastError") return resp.status(404).send(error);
            else return resp.status(500).send(error);
        }
    },

    async update(req, resp){
        const { name, description, ip, port } = req.body;

        const {hostId} = req.params;
        const hostUpdt = await db.Host.findByIdAndUpdate(
            hostId,
            { 
                $set: { 
                    name,
                    description,
                    ip,
                    port,
                    modified: Date.now(),
                } 
            },
            { new: true, useFindAndModify: false }
        );

        return resp.json(hostUpdt);

    }
}