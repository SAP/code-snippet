import * as vscode from 'vscode';
import * as _ from 'lodash';

export class Contributors {
    private static apiMap = new Map<string, any>();

    public static getSnippet(uiOptions: any) {
		let snippet  = undefined;
		const contributorName = _.get(uiOptions, "contributorName");
		const snippetName = _.get(uiOptions, "snippetName");
		const snippetContext = _.get(uiOptions, "context");
		if (contributorName && snippetName) {
			const api = Contributors.apiMap.get(contributorName);
			const snippets = api.geCodeSnippets(snippetContext);
			snippet  = snippets.get(snippetName);
		}
		return snippet;
	}

    public static add(extensionName: string, api: any) {
        Contributors.apiMap.set(extensionName, api);
    }

    private static async getApi(extension: vscode.Extension<any>, extensionName: string) {
        let api: any;
        if (!extension.isActive) {
            try {
                api = await extension.activate();
            } catch (error) {
                console.error(error);
                // TODO: Add Logger.error here ("Failed to activate extension", {extensionName: extensionName})
            }
        } else {
            api = extension.exports;
        }
        return api;
}

    public static async init() {
        let allExtensions: readonly vscode.Extension<any>[] = vscode.extensions.all;
        for (let currentExtensionIndex in allExtensions) {
            const currentExtension: vscode.Extension<any> = allExtensions[currentExtensionIndex];
            const currentPackageJSON: any = _.get(currentExtension, "packageJSON");
            const extensionDependencies: string[] = _.get(currentPackageJSON, "extensionDependencies");
            if (!_.isEmpty(extensionDependencies)) {
                const codeSnippetDependancy: boolean = _.includes (extensionDependencies,"saposs.code-snippet");
                if (codeSnippetDependancy) {
                    const extensionName: string =  _.get(currentPackageJSON, "name");
                    const api = await Contributors.getApi(currentExtension, extensionName);
                    Contributors.add(extensionName, api);
                }
            }
        }
    }

}