const socketio = require('socket.io');
const db = require('./models');
let io;

exports.setupWebsocket = (server) => {
    io = socketio(server);
    

    io.on("connection", (socket) => {
        console.log(socket.id);

        // setTimeout(() => {
        //     io.to(socket.id).emit("teste");
        // }, 3000)
    });
}

exports.sendNewFlow = async (flowId, ipTarget) => {
    try {
        const flowInstances = await db.Instance.find()
            .populate("operator", "name")
            .populate("flowId", "name");
        io.sockets.emit("flowStarted", flowId, flowInstances, ipTarget);
    } catch (error) {
        console.log(error);
    }
    
}

exports.sendEndFlow = async (flowId) => {
    try {
        const flowInstances = await db.Instance.find()
            .populate("operator", "name")
            .populate("flowId", "name");
        io.sockets.emit("flowFinished", flowId, flowInstances);
    } catch (error) {
        console.log(error);
    }
    
}

exports.sendNewPhase = async (flowId, phaseIx) => {
    try {
        const flowInstances = await db.Instance.find()
            .populate("operator", "name")
            .populate("flowId", "name");
        io.sockets.emit("phaseStarted", flowId, phaseIx, flowInstances);
    } catch (error) {
        console.log(error);
    }
}

exports.sendEndedPhase = async (flowId, phaseIx) => {
    try {
        const flowInstances = await db.Instance.find()
            .populate("operator", "name")
            .populate("flowId", "name");
        io.sockets.emit("phaseFinished", flowId, phaseIx, flowInstances);
    } catch (error) {
        console.log(error);
    }
}