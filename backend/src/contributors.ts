import * as vscode from 'vscode';
import * as _ from 'lodash';

export class Contributors {
    public static async getSnippet(contributerInfo: any) {
        const contributorId = _.get(contributerInfo, "contributorId");
        const extension = Contributors.getContributorExtension(contributorId);
        if (extension) {
            try {
                const api = await this.getApiPromise(extension as vscode.Extension<any>);
                const snippetContext = _.get(contributerInfo, "context");
                const snippets = api.getCodeSnippets(snippetContext);
                const snippetName = _.get(contributerInfo, "snippetName");
                return snippets.get(snippetName);
            } catch (error) {
                const errorMessage = _.get(error, "stack", _.get(error, "message", error));
                console.error(errorMessage);
                // TODO: Add Logger.error
            }
        }
    }

    private static getApiPromise(extension: vscode.Extension<any>) {
        return (extension.isActive ? extension.exports : extension.activate());
    }

    private static getContributorExtension(contributorId: string) {
        return _.find(vscode.extensions.all, (extension: vscode.Extension<any>) => {
            const extensionDependencies: string[] = _.get(extension, "packageJSON.extensionDependencies");
            if (_.includes(extensionDependencies, "saposs.code-snippet")) {
                if (contributorId === Contributors.getExtensionId(extension)) {
                    return extension;
                }
            }
        });
    }

    private static getExtensionId(extension: vscode.Extension<any>) {
        const extensionName: string = _.get(extension, "packageJSON.name");
        const extensionPublisher: string = _.get(extension, "packageJSON.publisher");
        return `${extensionPublisher}.${extensionName}`;
    }
}
