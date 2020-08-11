import * as vscode from 'vscode';
import * as _ from 'lodash';

export class Contributors {
    private static readonly apiMap = new Map<string, any>();

    public static getSnippet(uiOptions: any) {
		let snippet  = undefined;
		const contributorId = _.get(uiOptions, "contributorId");
		const snippetName = _.get(uiOptions, "snippetName");
		const snippetContext = _.get(uiOptions, "context");
		if (contributorId && snippetName) {
			const api = Contributors.apiMap.get(contributorId);
			const snippets = api.getCodeSnippets(snippetContext);
			snippet  = snippets.get(snippetName);
		}
		return snippet;
	}

    public static add(extensionId: string, api: any) {
        Contributors.apiMap.set(extensionId, api);
    }

    private static async getApi(extension: vscode.Extension<any>, extensionId: string) {
        let api: any;
        if (!extension.isActive) {
            try {
                api = await extension.activate();
            } catch (error) {
                console.error(error);
                // TODO: Add Logger.error here ("Failed to activate extension", {extensionId: extensionId})
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
                    const extensionPublisher: string =  _.get(currentPackageJSON, "publisher");
                    const extensionId: string = extensionPublisher + "." + extensionName;
                    const api = await Contributors.getApi(extension, extensionId);
                    Contributors.add(extensionId, api);
                }
            }
        }
    }

}