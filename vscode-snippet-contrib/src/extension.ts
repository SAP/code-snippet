import * as _ from 'lodash';
import * as vscode from 'vscode';
import { ISnippet } from '@sap-devx/code-snippet-types';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "snippet1" is now active!');

	let disposable = vscode.commands.registerCommand('extension.snippetContributor', () => {
		vscode.window.showInformationMessage('Hello snippet contributor!');
	});

	context.subscriptions.push(disposable);

	let disposable1 = vscode.commands.registerCommand('extension.showCodeSnippetContributor', (uri: vscode.Uri) => {
		try {
			vscode.commands.executeCommand("loadCodeSnippet", {contributorName: "vscode-snippet-contrib", snippetName: "snippet_1", context: {uri: uri}});
		  } catch (error) {
			vscode.window.showInformationMessage(error);
		}
	});

	context.subscriptions.push(disposable1);

	const api = {
		geCodeSnippets(context: any) {
			const snippets = new Map<string, ISnippet>();
			let snippet: ISnippet = {
				getMessages() {
					return {title: "Create an action", description: "Select the action, target, service, and entity set to which you want to connect."};
				},
				getQuestions() {
					return createCodeSnippetQuestions(context);
				},
				async getWorkspaceEdit(answers: any) {
					let outputFolder: string;
					if (context.uri) {
						outputFolder = context.uri.path;
					} else {
						outputFolder = _.get(vscode, "workspace.workspaceFolders[0].uri.path");
					}

					if (!outputFolder || !outputFolder.length) {
						vscode.window.showErrorMessage("Cannot find folder");
						return;
					}
					const docUri: vscode.Uri = vscode.Uri.parse(outputFolder + '/newFile.md');

					const we = new vscode.WorkspaceEdit();
					we.createFile(docUri, { ignoreIfExists: true });

					const metadata = {needsConfirmation: true, label: "snippet contributor"};
					we.insert(docUri, new vscode.Position(0, 0), docUri.fsPath + '\n', metadata);
					we.insert(docUri, new vscode.Position(0, 0), answers.actionName + '\n', metadata);
					we.insert(docUri, new vscode.Position(0, 0), answers.actionTemplate + '\n', metadata);
					we.insert(docUri, new vscode.Position(0, 0), answers.actionType + '\n', metadata);

					return we;
				}
			}
			snippets.set("snippet_1", snippet);
			return snippets;
		},
	};

	return api;
}

function createCodeSnippetQuestions(context: any) : any[] {
	const questions: any[] = [];

    questions.push(
		{
		  guiOptions: {
			hint: "hint actionTemplate"
		  },
		  type: "list",
		  name: "actionTemplate",
		  message: "Action Template",
		  choices: [
			'OData action',
			'Offline action',
			'Message acion',
			'Change user password'
		  ]
		},
		{
		  guiOptions: {
			hint: "hint actionName"
		  },
		  type: "input",
		  name: "actionName",
		  message: "Action Name",
		  validate: (value: any, answers: any) => {
			return (value.length > 1 ? true : "Enter at least 2 characters");
		  }
		},
		{
		  guiOptions: {
			hint: "hint actionType"
		  },
		  type: "list",
		  name: "actionType",
		  message: "Action Type",
		  choices: [
			'Create entity',
			'Log',
			'Close page'
		  ]
		}
	  );
  
    return questions;
}

export function deactivate() {}
