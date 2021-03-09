import * as _ from 'lodash';
import * as vscode from 'vscode';
import { createExtensionLoggerAndSubscribeToLogSettingsChanges, getLogger } from "./logger/logger-wrapper";
import { CodeSnippetPanel } from './panels/CodeSnippetPanel';
import { AbstractWebviewPanel } from './panels/AbstractWebviewPanel';
import { SWA } from './swa-tracker/swa-tracker-wrapper';

let extContext: vscode.ExtensionContext;
let codeSnippetPanel: CodeSnippetPanel;

export function activate(context: vscode.ExtensionContext) {
	extContext = context;

	try {
		createExtensionLoggerAndSubscribeToLogSettingsChanges(context);
		SWA.createSWATracker(getLogger());
	} catch (error) {
		console.error("Extension activation failed due to Logger configuration failure:", error.message);
		return;
	}

	codeSnippetPanel = new CodeSnippetPanel(extContext);
	registerAndSubscribeCommand("loadCodeSnippet", codeSnippetPanel.loadWebviewPanel.bind(codeSnippetPanel));
	registerAndSubscribeCommand("codeSnippet.toggleOutput", codeSnippetPanel.toggleOutput.bind(codeSnippetPanel));
	registerWebviewPanelSerializer(codeSnippetPanel);
}

function registerAndSubscribeCommand(cId: string, cAction: any) {
	extContext.subscriptions.push(vscode.commands.registerCommand(cId, cAction));
}

function registerWebviewPanelSerializer(abstractPanel: AbstractWebviewPanel) {
	vscode.window.registerWebviewPanelSerializer(abstractPanel.viewType, {
		async deserializeWebviewPanel(webViewPanel: vscode.WebviewPanel, state?: any) {
			abstractPanel.setWebviewPanel(webViewPanel, state);
		}
	});
}

export function deactivate() {
	codeSnippetPanel = null;
}
