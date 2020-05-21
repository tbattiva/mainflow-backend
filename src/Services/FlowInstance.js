const db = require('../models');
const zoweInterface = require('./ZoweInterface');
const { sendNewFlow, sendEndFlow} = require('../websocket');

module.exports = class FlowInstance {
    constructor(flowId, operator,app){
        this.app = app;

        this.flowId = flowId;
        this.starttime = undefined;
        this.endtime = undefined;
        this.status = "not started"; 
        this.phase = 0; 
        this.size = 0; 
        this.operator = operator; 

        this.instance = undefined;
        this.flow = undefined;
        this.isConnected = false;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async build(){
        this.flow = await db.Flow.findById(this.flowId);
        this.size = this.flow.phases.length;

        await this.insert();
    }

    async insert(){
        this.instance = await db.Instance.create(this.json());
        this.app.locals.flowInstances[this.instance.flowId] = true;
        return;
    }

    async update(callback = (docInstance) => {}, callerror = (err) => {}){
        const upd = await db.Instance.findByIdAndUpdate(
            this.instance._id, 
            {
                $set:this.json()
            },
            {new:true, useFindAndModify:false}
        ).then(docInstance => {
            this.instance = docInstance;
            callback(docInstance);
        }).catch(error => {
            console.log(error);
            callerror(error);
        });
        return upd;
    }

    json(){
        return {
            starttime: this.starttime,
            endtime: this.endtime,
            flowId: this.flowId,
            status: this.status,
            phase: this.phase,
            size: this.size,
            operator: this.operator,
            ip:this.ip
        }
    }

    async execNext(){
        if (this.app.locals.flowInstances[this.instance.flowId]){
            if((this.instance.status == "starting" || this.instance.status == "running") ){
                console.log("waiting", Date.now())
                try {
                    
                    await this.sleep(5000);
                } catch (error) {
                    console.log("erro")
                }
                console.log("waiting", Date.now())
                
                const next = db.Instance.findByIdAndUpdate(
                    this.instance._id,
                    {
                        $set:{
                            phase: this.phase+1,
                            status: "running"
                        }
                    },
                    { new: true, useFindAndModify: false }
                ).then( async docInstance =>{
                    this.instance = docInstance;
                    this.status = docInstance.status;
                    this.phase = docInstance.phase;

                    if(docInstance.phase <= docInstance.size){
                        // busca phase
                        this.execPhase();
                        
                    }
                    else{
                        this.status = "ended";
                        this.endtime = Date.now();
                        this.update(
                            docInstance => {
                                console.log(`Flow (${docInstance.flowId}) Execution Finished by instance ${docInstance._id}`);
                                this.finish();
                            },
                            err => {
                                console.log(`Flow (${docInstance.flowId}) Finalization ERROR <<< by instance ${docInstance._id}`);
                                console.log('------------ERROR MSG--------------')
                                console.log(err);
                                this.finish();
                            }
                        );
                        
                    }

                    return 1;
                }).catch(() => {
                    return -1;
                });
            }
        }
        else{
            this.stop();
        }
        return 0;
    }

    execPhase(){
        const phase = db.Phase
            .findById(this.flow.phases[this.phase-1])
                .then(async docPhase =>{
                    let resp = "";
                    let result = "";
                    if (docPhase.type == 1){
                        // run job stored on mainframe
                    }
                    else if (docPhase.type == 2){
                        // run job stored on db
                        resp = await this.zInterface.submitJCL(docPhase.object);
                        result = resp.retcode;
                    }
                    else if (docPhase.type == 3){
                        // run console command
                        resp = await this.zInterface.sendConsoleCommand(docPhase.object);
                        result = resp.success;
                    }
                    console.log(resp);
                    const saveRet = db.Instance.findByIdAndUpdate(
                        this.instance._id,
                        {
                            $push:{
                                phaseOutput: resp 
                            }
                        },
                        { new: true, useFindAndModify: false }
                    ).then( async docInstance =>{
                        this.instance = docInstance;
                        
                    }).catch(error =>{
                        console.log(error);
                    });
                    if(docPhase.nextPhaseCondition.indexOf(result.toString())>=0){
                        this.execNext();
                    }
                    else{
                        this.stopByError(`RESULT CONDITION on phase ${this.instance.phase}: ${result}`);
                    }
                }).catch(error =>{
                    this.stopByError(error);
                });
    }

    async connect(user, pass, ip, port){
        this.ip = ip;
        this.zInterface = new zoweInterface(user, pass, ip, port);
        this.isConnected = await this.zInterface.startSession();

        console.log("isConnected:", this.isConnected);

        return this.isConnected;
    }

    async start(){
        if(this.instance && this.isConnected){
            const starttime = Date.now();
            const start = await db.Instance.findByIdAndUpdate(
                this.instance._id,
                {
                    $set:{
                        starttime,
                        phase: 0,
                        status: "starting"
                    }
                },
                { new: true, useFindAndModify: false }
            ).then( async docInstance =>{
                this.instance = docInstance;
                this.starttime = docInstance.starttime;
                this.status = docInstance.status;
                this.phase = docInstance.phase;

                sendNewFlow(this.instance.flowId);
                this.execNext();

                
            }).catch(() => {
                // encerrar instancia
            });

            return 1;
        }

        return 0;
    }
    async stop(){
        this.endtime = Date.now();
        this.status = "stoped";

        console.log(`Flow (${this.instance.flowId}) Execution STOPED by command (instance ${this.instance._id})`);
        
        this.update(
            (docInstance) =>{ this.finish(); },
            (error) =>{ this.finish(); }
        )

    }

    async pause(){

    }
    async resume(){

    }

    async stopByError(error){
        this.endtime = Date.now();
        this.status = "error";

        console.log(`Flow (${this.instance.flowId}) EXECUTION ERROR <<< by instance ${this.instance._id}`);
        console.log('------------ERROR MSG--------------')
        console.log(error);

        this.update(
            (docInstance) =>{},
            (error) =>{}
        )
        
    }

    finish(){
        this.app.locals.flowInstances[this.instance.flowId] = false;
        sendEndFlow();
    }
    
}


