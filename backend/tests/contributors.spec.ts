import * as mocha from 'mocha';
import { expect } from 'chai';
import * as _ from 'lodash';
import { mockVscode } from './mockUtil';

const testVscode = {
    extensions: {
        all: new Array()
    }
};

mockVscode(testVscode, "src/contributors.ts");
import { Contributors } from "../src/contributors";

describe('Contributors unit test', () => {
    describe('init', () => {
        beforeEach(() => {
            Contributors.apiMap.clear();
        });

        it("no relevant contributors", () => {
            const extension = {
                id: "id",
                extensionPath: "extensionPath",
                extensionUri: null as any,
                isActive: true,
                packageJSON: {
                    name: "vscode-snippet-blabla1",
                    publisher: "BLABLA1",
                    extensionDependencies: ["BLABLA.vscode-snippet-contrib"]
                },
                extensionKind: null as any,
                activate: () => Promise.resolve(),
                exports: {}
            };

            testVscode.extensions.all = [extension];

            Contributors.init();
            expect(Contributors.apiMap).to.have.lengthOf(0);
        });

        it("extension activate throws error", () => {
            const extension = {
                id: "id",
                extensionPath: "extensionPath",
                extensionUri: null as any,
                isActive: false,
                packageJSON: {
                    name: "vscode-snippet-blabla",
                    publisher: "BLABLA",
                    extensionDependencies: ["saposs.code-snippet"]
                },
                extensionKind: null as any,
                activate: () => {
                    throw new Error();
                },
                exports: {}
            };

            testVscode.extensions.all = [extension];

            Contributors.init();
            expect(Contributors.apiMap).to.have.lengthOf(0);
        });

        it("1 contributor", () => {
            const extension = {
                id: "id",
                extensionPath: "extensionPath",
                extensionUri: null as any,
                isActive: true,
                packageJSON: {
                    name: "vscode-snippet-blabla2",
                    publisher: "BLABLA2",
                    extensionDependencies: ["saposs.code-snippet"]
                },
                extensionKind: null as any,
                activate: () => Promise.resolve(),
                exports: {
                    getCodeSnippets: () => {}
                }
            };
            
            testVscode.extensions.all = [extension];

            Contributors.init();
            expect(Contributors.apiMap).to.have.lengthOf(1);
        });
    });

    describe('getSnippet', () => {
        function createCodeSnippetQuestions(): any[] {
            const questions: any[] = [{
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
            }];

            return questions;
        }

        function getSnippet() {
            return {
                getMessages() {
                    return messageValue;
                },
                async getQuestions() {
                    return createCodeSnippetQuestions();
                },
                async getWorkspaceEdit() { }
            };
        }

        const messageValue = {
            title: "Create a new action",
            description: "Select the action, target, service and the entity set you want to connect to."
        };

        const snippetName = "snippet_test";
        const api = {
            id: "id",
            extensionPath: "extensionPath",
            extensionUri: null as any,
            isActive: true,
            packageJSON: {
                name: "vscode-snippet-contrib",
                publisher: "BLABLA3",
                extensionDependencies: ["saposs.code-snippet"]
            },
            extensionKind: null as any,
            activate: () => Promise.resolve(),
            exports: {
                getCodeSnippets: () => {
                    const snippets = new Map<string, any>();
                    const snippet: any = getSnippet();
                    snippets.set(snippetName, snippet);
                    return snippets;
                }
            }
        };
        const extensionId = "BLABLA3.vscode-snippet-contrib";
        
        it("receives no contributorId and no snippetName ---> returns undefined snippet", async () => {
            const uiOptions = {};
            const snippet = await Contributors.getSnippet(uiOptions);
            expect(snippet).to.be.undefined;
        });

        it("receives valid contributorId and snippetName ---> returns valid snippet", async () => {
            testVscode.extensions.all = [];
            Contributors.init();
            Contributors.add(api);

            const uiOptions = {
                "contributorId": extensionId,
                "snippetName": snippetName
            };
            const snippet = await Contributors.getSnippet(uiOptions);
            expect(snippet.getMessages()).to.deep.equal(messageValue);
        });
    });
});
