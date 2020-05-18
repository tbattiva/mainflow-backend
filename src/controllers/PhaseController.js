const db = require('../models');

module.exports = {
    index(){

    },


    async store(req, resp){
        const {flowId} = req.params;
        const author = req.get('user-id');
        const { name, description, type, object, nextPhaseCondition, seqNum } = req.body;
    
        const flow = db.Flow.findById(flowId).then(async docFlow =>{
            if (docFlow == null) return resp.status(404).json({ret: 0, message: 'Flow not found!'});
            const addedPhase = await db.Phase.create({
                name,
                description,
                type,
                object,
                nextPhaseCondition,
                seqNum,
                author,
                flowId,
                creation: Date.now(),
                modified: Date.now()
            }).then(async (docPhase) => {
                const flowRelationship = await db.Flow.findByIdAndUpdate(
                    flowId,
                    { $push: { phases: docPhase._id } },
                    { new: true, useFindAndModify: false }
                );

                return resp.json(docPhase);
            }).catch(() => {
                return resp.status(500).json({ret: -1, message: 'Phase add has got problems!'});
            });
        }).catch(() => {
            resp.status(500).json({ret: -1, message: 'Finding Flow problems!'});
        }); 
        
    },

    async delete(req, resp){
        const { flowId, phaseId } = req.params;
        const deleteOp = await db.Phase.deleteOne({"_id": phaseId, "flowId": flowId});

        const updOp = await db.Flow.findByIdAndUpdate(
            flowId,
            {
                $pull: {
                    phases: phaseId
                }
            },
            {multi: false, new: true}
        )

        return resp.send(updOp);
    },

    async update(req, resp){
        const { flowId, phaseId } = req.params;
        const { name, description, type, object, nextPhaseCondition, seqNum } = req.body;

        const changedPhase = await db.Phase.findByIdAndUpdate(
            phaseId,
            {
                $set:{
                    name,
                    description,
                    type,
                    object,
                    nextPhaseCondition,
                    seqNum,
                    modified: Date.now()
                }
            },
            { new: true, useFindAndModify: false }
        ).then(docPhase => {
            resp.json(docPhase);
        }).catch(() => {
            resp.status(500).json({ret: -1, message: 'Changing Phase problems!'});
        });
    }
}