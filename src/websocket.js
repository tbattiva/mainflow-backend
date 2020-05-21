const socketio = require('socket.io');
const db = require('./models');
let io;

exports.setupWebsocket = (server) => {
    io = socketio(server);
    

    io.on("connection", (socket) => {
        console.log(socket.id)
    });
}

exports.sendNewFlow = async (flowId) => {
    try {
        const flowInstances = await db.Instance.find();
        io.sockets.emit("flowStarted", flowId, flowInstances);
    } catch (error) {
        console.log(error);
    }
    
}

exports.sendEndFlow = async (flowId) => {
    try {
        const flowInstances = await db.Instance.find();
        io.sockets.emit("flowFinished", flowId, flowInstances);
    } catch (error) {
        console.log(error);
    }
    
}