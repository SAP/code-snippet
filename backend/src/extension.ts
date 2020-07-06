import * as _ from 'lodash';
import * as vscode from 'vscode';
import { createExtensionLoggerAndSubscribeToLogSettingsChanges } from "./logger/logger-wrapper";
import { Contributors } from './contributors';
import { CodeSnippetPanel } from './panels/CodeSnippetPanel';
import { AbstractWebviewPanel } from './panels/AbstractWebviewPanel';

let extContext: vscode.ExtensionContext;
let codeSnippetPanel: CodeSnippetPanel;

export function activate(context: vscode.ExtensionContext) {
	extContext = context;

	try {
		createExtensionLoggerAndSubscribeToLogSettingsChanges(context);
	} catch (error) {
		console.error("Extension activation failed due to Logger configuration failure:", error.message);
		return;
	}

	Contributors.init();

	codeSnippetPanel = new CodeSnippetPanel(extContext);
	registerAndSubscribeCommand("loadCodeSnippet", codeSnippetPanel.loadCodeSnippet.bind(codeSnippetPanel));
	registerAndSubscribeCommand("codeSnippet.toggleOutput", codeSnippetPanel.toggleOutput.bind(codeSnippetPanel));
	registerWebviewPanelSerializer(codeSnippetPanel);
}

function registerAndSubscribeCommand(cId: string, cAction: any) {
	extContext.subscriptions.push(vscode.commands.registerCommand(cId, cAction));
}

function registerWebviewPanelSerializer(abstractPanel: AbstractWebviewPanel) {
	vscode.window.registerWebviewPanelSerializer(abstractPanel.viewType, {
		async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state?: any) {
			abstractPanel.setWebviewPanel(webviewPanel, state);
		}
	});
}

export function deactivate() {
	codeSnippetPanel = null;
}
