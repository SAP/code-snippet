import * as vscode from 'vscode';
import * as _ from 'lodash';

export class Contributors {
    private static readonly apiMap = new Map<string, any>();

    public static getSnippet(uiOptions: any) {
		let snippet  = undefined;
		const contributorName = _.get(uiOptions, "contributorName");
		const snippetName = _.get(uiOptions, "snippetName");
		const snippetContext = _.get(uiOptions, "context");
		if (contributorName && snippetName) {
			const api = Contributors.apiMap.get(contributorName);
			const snippets = api.getCodeSnippets(snippetContext);
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
        const allExtensions: readonly vscode.Extension<any>[] = vscode.extensions.all;
        for (const extension of allExtensions) {
            const currentPackageJSON: any = _.get(extension, "packageJSON");
            const extensionDependencies: string[] = _.get(currentPackageJSON, "extensionDependencies");
            if (!_.isEmpty(extensionDependencies)) {
                const codeSnippetDependancy: boolean = _.includes (extensionDependencies,"saposs.code-snippet");
                if (codeSnippetDependancy) {
                    const extensionName: string =  _.get(currentPackageJSON, "name");
                    const api = await Contributors.getApi(extension, extensionName);
                    Contributors.add(extensionName, api);
                }
            }
        }
    }

}