import * as vscode from 'vscode';
import * as _ from 'lodash';
import { AppEvents } from "./app-events";
import { RpcCommon } from "@sap-devx/webview-rpc/out.ext/rpc-common";

export class VSCodeEvents implements AppEvents {
    private webviewPanel: vscode.WebviewPanel;

    constructor(rpc: RpcCommon, webviewPanel: vscode.WebviewPanel) {
        this.webviewPanel = webviewPanel;   
    }

    public async doApply(we: vscode.WorkspaceEdit): Promise<any> {
        // Apply code
        await vscode.workspace.applyEdit(we);
    }

    public doSnippeDone(success: boolean, message: string, targetFolderPath?: string): void {
        this.doClose();
        this.showDoneMessage(success, message, targetFolderPath);
    }

    private doClose(): void {
        if (this.webviewPanel) {
            this.webviewPanel.dispose();
            this.webviewPanel = null;
        }
    }

    private showDoneMessage(success: boolean, message: string, targetFolderPath?: string): Thenable<any> {

        if (success) {
            return vscode.window.showInformationMessage(message);
        }

        return vscode.window.showErrorMessage(message);
    }
}
