import * as _ from 'lodash';
import * as path from 'path';
import * as os from "os";
import * as vscode from 'vscode';
import { CodeSnippet } from "../code-snippet";
import { RpcExtension } from '@sap-devx/webview-rpc/out.ext/rpc-extension';
import { AppLog } from "../app-log";
import backendMessages from "../messages";
import { OutputChannelLog } from '../output-channel-log';
import { AppEvents } from "../app-events";
import { VSCodeEvents } from '../vscode-events';
import { AbstractWebviewPanel } from './AbstractWebviewPanel';
import { Contributors } from "../contributors";


export class CodeSnippetPanel extends AbstractWebviewPanel {
	public static CODE_SNIPPET = "Code Snippet";
	private static channel: vscode.OutputChannel;

	public toggleOutput() {
		this.outputChannel.showOutput();
	}

	public setWebviewPanel(webViewPanel: vscode.WebviewPanel, uiOptions?: any) {
		const contributorInfo = _.get(uiOptions, "contributorInfo", uiOptions);

		if (_.get(uiOptions, "stateError")) {
			this.logger.error("test");
			this.logger.error(`'${contributorInfo.contributorId}' snippet state could not be saved. JSON.stringify issue.`); 
			return webViewPanel.dispose();
		}

		this.contributors.getSnippet(contributorInfo).then(snippet => {
			if (_.isNil(snippet)) {
				this.logger.error(`'${contributorInfo.contributorId}' snippet could not be found.`); 
				return this.webViewPanel.dispose();
			}

			super.setWebviewPanel(webViewPanel, uiOptions);

			this.messages = _.assign({}, backendMessages, snippet.getMessages());
			const rpc = new RpcExtension(this.webViewPanel.webview);
			this.outputChannel = new OutputChannelLog(this.messages.channelName);
			const vscodeEvents: AppEvents = new VSCodeEvents(rpc, this.webViewPanel);
			this.codeSnippet = new CodeSnippet(rpc,
				vscodeEvents,
				this.outputChannel,
				this.logger,
				{ messages: this.messages, snippet, contributorInfo});
			this.codeSnippet.registerCustomQuestionEventHandler("file-browser", "getFilePath", this.showOpenFileDialog.bind(this));
			this.codeSnippet.registerCustomQuestionEventHandler("folder-browser", "getPath", this.showOpenFolderDialog.bind(this));

			this.initWebviewPanel();
		});
	}

	public static getOutputChannel(channelName: string): vscode.OutputChannel {
		if (!this.channel) {
			this.channel = vscode.window.createOutputChannel(`${CodeSnippetPanel.CODE_SNIPPET}.${channelName}`);
		}

		return this.channel;
	}

	private codeSnippet: CodeSnippet;
	private messages: any;
	private outputChannel: AppLog;
	private readonly contributors: Contributors;

	public constructor(context: vscode.ExtensionContext) {
		super(context);
		this.viewType = "codeSnippet";
		this.viewTitle = CodeSnippetPanel.CODE_SNIPPET;
		this.focusedKey = "codeSnippet.Focused";
		this.contributors = new Contributors();
	}

	private async showOpenFileDialog(currentPath: string): Promise<string> {
		return await this.showOpenDialog(currentPath, true);
	}

	private async showOpenFolderDialog(currentPath: string): Promise<string> {
		return await this.showOpenDialog(currentPath, false);
	}

	private async showOpenDialog(currentPath: string, canSelectFiles: boolean): Promise<string> {
		const canSelectFolders = !canSelectFiles;

		let uri;
		try {
			uri = vscode.Uri.file(currentPath);
		} catch (e) {
			uri = vscode.Uri.file(path.join(os.homedir()));
		}

		try {
			const filePath = await vscode.window.showOpenDialog({
				canSelectFiles,
				canSelectFolders,
				defaultUri: uri
			});
			return _.get(filePath, "[0].fsPath", currentPath);
		} catch (error) {
			return currentPath;
		}
	}

	public disposeWebviewPanel() {
		super.disposeWebviewPanel();
		this.codeSnippet = null;
	}

	public initWebviewPanel() {
		super.initWebviewPanel();
		this.webViewPanel.title = this.messages.title;
	}
}
