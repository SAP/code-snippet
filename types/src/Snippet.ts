import * as vscode from 'vscode';

export interface ISnippet {
    getMessages(): any;
    getQuestions(): Promise<any[]>;
    getWorkspaceEdit(answers: any): Promise<vscode.WorkspaceEdit | undefined>;
}
