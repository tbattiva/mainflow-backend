const zowe = require('@zowe/cli');

module.exports = class ZoweInterface{
    constructor(user, pass, host, port = 10443, rejectUnauthorized = false){
        this.zosmfProfile = {
            host:host,
            port:port,
            user:user,
            password:pass,
            rejectUnauthorized:rejectUnauthorized
        }

    }
    
    async startSession(){
        try {
            console.log(this.zosmfProfile)
            this.zosmfSession = await zowe.ZosmfSession
                .createBasicZosmfSession(this.zosmfProfile);

            
            this.tso = await this.checkSession();
            return 1;
        } catch (error) { 
            console.log(error);
            return 0;
        }

    }

    async checkSession(){
        const tso = await zowe.StartTso.start(this.zosmfSession, 'fb3', null);
        return tso;
    }

    async sendConsoleCommand(command){
        try {
            const resp = await zowe.IssueCommand.issueSimple(this.zosmfSession, command);
            return resp;
        } catch (error) {
            return -1;
        }
    
    }

    async submitJCL(jcl){
        try {
            const resp = await zowe.SubmitJobs.submitJclNotify(this.zosmfSession, jcl, {jclSource: "stdin", viewAllSpoolContent: true});
            return resp;
        } catch (error) {
            console.log(error)
            return -1;
        }
    }
}