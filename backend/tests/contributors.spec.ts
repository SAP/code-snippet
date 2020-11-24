import * as mocha from 'mocha';
import { expect } from 'chai';
import * as _ from 'lodash';
import { mockVscode } from './mockUtil';

const testVscode = {};
_.set(testVscode, "extensions.all", []);

mockVscode(testVscode, "src/contributors.ts");
import { Contributors } from "../src/contributors";

describe('Contributors unit test', () => {
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
                async getWorkspaceEdit() { return; }
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
            activate: () => Promise.resolve({
                getCodeSnippets: () => {
                    const snippets = new Map<string, any>();
                    const snippet: any = getSnippet();
                    snippets.set(snippetName, snippet);
                    return snippets;
                }
            }),
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

        it("receives valid contributorId and snippetName from exports ---> returns valid snippet", async () => {
            _.set(testVscode, "extensions.all", [api]);

            const uiOptions = {
                "contributorId": extensionId,
                "snippetName": snippetName
            };
            const snippet = await Contributors.getSnippet(uiOptions);
            expect(snippet.getMessages()).to.deep.equal(messageValue);
        });

        it("receives valid contributorId and snippetName from activate ---> returns valid snippet", async () => {
            api.isActive = false;
            _.set(testVscode, "extensions.all", [api]);

            const uiOptions = {
                "contributorId": extensionId,
                "snippetName": snippetName
            };
            const snippet = await Contributors.getSnippet(uiOptions);
            expect(snippet.getMessages()).to.deep.equal(messageValue);
        });

        it("contributer extension activate fails", async () => {
            api.isActive = false;
            api.activate = () => {
                throw new Error();
            };
            _.set(testVscode, "extensions.all", [api]);

            const uiOptions = {
                "contributorId": extensionId,
                "snippetName": snippetName
            };
            const res = await Contributors.getSnippet(uiOptions);
            expect(res).to.be.undefined;
        });

        it("no contributer extension not found", async () => {
            api.packageJSON = {
                name: "vscode-snippet-contrib",
                publisher: "BLABLA3",
                extensionDependencies: ["saposs-other.code-snippet"]
            };
            _.set(testVscode, "extensions.all", [api]);

            const uiOptions = {
                "contributorId": extensionId,
                "snippetName": snippetName
            };
            const res = await Contributors.getSnippet(uiOptions);
            expect(res).to.be.undefined;
        });

        it("no contributer extension not found by contributorId", async () => {
            api.packageJSON = {
                name: "vscode-snippet-contrib",
                publisher: "BLABLA3",
                extensionDependencies: ["saposs.code-snippet"]
            };
            _.set(testVscode, "extensions.all", [api]);

            const uiOptions = {
                "contributorId": extensionId + "-other",
                "snippetName": snippetName
            };
            const res = await Contributors.getSnippet(uiOptions);
            expect(res).to.be.undefined;
        });
    });
});
