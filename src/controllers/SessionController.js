const db = require('../models');

module.exports = {
    async index(req, resp){
        const {email, password} = req.body;

        try {
            const user = await db.User.findOne({email}).where({password});
            if (!user) resp.sendStatus(404);
            else resp.json(user);
        } catch (error) {
            return resp.status(500).send(error);
        }

    },


    async store(req, resp){
        
        
    },

    async delete(req, resp){
        
    },

    async update(req, resp){
        

    }
}