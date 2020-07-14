import { ISnippet } from '@sap-devx/code-snippet-types';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import { ConfigHelper } from "./configHelper";

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "snippet1" is now active!');

	let disposable = vscode.commands.registerCommand('extension.showCodeSnippetContrib', (uri: vscode.Uri) => {
		try {
			vscode.commands.executeCommand("loadCodeSnippet", {contributorName: "vscode-snippet-contrib", snippetName: "snippet_1", context: {uri: uri}});
		  } catch (error) {
			vscode.window.showInformationMessage(error);
		}
	});

	context.subscriptions.push(disposable);

	const api = {
		geCodeSnippets(context: any) {
			const snippets = new Map<string, ISnippet>();
			let snippet: ISnippet = {
				getMessages() {
					return {
						title: "Create Launch Configuration",
						description: "Select Name, Environment, Target to which you want to create launch configuration.",
						applyButton: "Create"
					};
				},
				getQuestions() {
					return createCodeSnippetQuestions(context);
				},
				async getWorkspaceEdit(answers: any) {
					let outputFile: string;
					if (context.uri) {
						outputFile = context.uri.path;
					} else {
						let outputFolder = _.get(vscode, "workspace.workspaceFolders[0].uri.path");
						if (!outputFolder || !outputFolder.length) {
							vscode.window.showErrorMessage("Cannot find folder");
							return;
						}
						outputFile = outputFolder + '/.vscode/launch.json';
					}

					const docUri: vscode.Uri = vscode.Uri.parse(outputFile);

					const configurations = await ConfigHelper.readFile(docUri.fsPath);

					const config = {
						name: answers.configName,
						type: answers.configType,
						program: answers.configProgram
					};
					configurations['configurations'].push(config)

					const we = new vscode.WorkspaceEdit();
					we.createFile(docUri, { ignoreIfExists: true });

					const metadata = {needsConfirmation: true, label: "snippet contributor"};
					const newText = ConfigHelper.getString(configurations);
					const range = await ConfigHelper.getRange(docUri);
					we.replace(docUri, range, newText, metadata);

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
			hint: "hint config type"
		  },
		  type: "list",
		  name: "configType",
		  message: "Type",
		  choices: [
			'node',
			'extensionHost'
		  ]
		},
		{
		  guiOptions: {
			hint: "hint config name"
		  },
		  type: "input",
		  name: "configName",
		  message: "Name",
		  validate: (value: any, answers: any) => {
			return (value.length > 1 ? true : "Enter at least 2 characters");
		  }
		},
		{
		  guiOptions: {
			hint: "hint config program",
			type: "file-browser",
		  },
		  type: "input",
		  name: "configProgram",
		  message: "Program"
		}
	  );
  
    return questions;
}

export function deactivate() {}
