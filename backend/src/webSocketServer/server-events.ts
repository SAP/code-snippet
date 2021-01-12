import { AppEvents } from "../app-events";
import { RpcCommon } from "@sap-devx/webview-rpc/out.ext/rpc-common";

export class ServerEvents implements AppEvents {
    private readonly rpc: RpcCommon;

    constructor(rpc: RpcCommon) {
        this.rpc = rpc;        
    }
    
    public async doApply(we: any): Promise<any> {
        // Apply code
    }

    doSnippeDone(suceeded: boolean, message: string, targetPath = ""): void {
        this.rpc.invoke("snippetDone", [suceeded, message, targetPath]);
    }

    executeCommand(id: string, ...args: any[]): Thenable<any> {
        return;
    }

    public doClose(): void {
        return;
    }
}
