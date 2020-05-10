const db = require('../models');

module.exports = {
    index(){

    },

    async store(req, resp){
        const { name, email, username, password, birth, company, github } = req.body;

        
        const addedUser = await db.User.create({
            name,
            email,
            username,
            password,
            birth,
            company,
            github,
            creation: Date.now(),
            modified: Date.now()
        })
        return resp.json(addedUser);
    },

    async delete(req, resp){
        const {userId} = req.params;

        const deleteOp = await db.User.deleteOne({"_id": userId});
        return resp.json(deleteOp);
    },

    update(){

    }
}