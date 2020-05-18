const db = require('../models');

module.exports = {
    async index(req, resp){
        try {
            const flows = await db.Flow.find()
                .populate('author', 'name -_id');

            return resp.send(flows);
        } catch (error) {
            return resp.status(500).json({ret: -1, message: error.message});
        }
    },

    async open(req, resp){
        try {
            const gottenFlow = await db.Flow.findById(req.params.id)
                .populate('author', 'name -_id')
                .populate('phases', ' -__v -creation -flowId');
            //console.log()
            return resp.send(gottenFlow);
        } catch (error) {
            return resp.status(404).json({ret: 0, message: "Flow not Found!"});
        }
        
    },

    async store(req, resp){
        const { name, description, phases, author } = req.body;
      
        const addedFlow = await db.Flow.create({
            name,
            description,
            phases,
            author,
            creation: Date.now(),
            modified: Date.now()
        })
        return resp.json(addedFlow);
    },

    async delete(req, resp){
        // 1 - ok; -1 error on flow delete; -2 error on phases delete
        const { flowId } = req.params;
        const res = await db.Flow.deleteOne({"_id": flowId}).then(async deleteFlow =>{

            if (deleteFlow.ok){
                if (deleteFlow.deletedCount > 0){
    
                    const deletePhases = await db.Phase.deleteMany({flowId}).then( deletePhases => {
                        return resp.json({ret: 1});
                    }).catch(() => {
                        return resp.json({ret: -2});
                    });
                }
                return resp.json({ret: 1});
            }
        }).catch(() => {
            return resp.json({ret: -1});
        });
        

    },

    async update(req, resp){
        const { flowId } = req.params;
        const { name, description } = req.body;
        const changedFlow = await db.Flow.findOneAndUpdate(
            flowId,
            {
                $set:{
                    name,
                    description,
                    modified: Date.now()
                }
            },
            { new: true, useFindAndModify: false }
        );

        return resp.json(changedFlow);
    }
}