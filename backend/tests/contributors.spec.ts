import { expect } from "chai";
import * as sinon from "sinon";
import * as _ from "lodash";
import { mockVscode } from "./mockUtil";

const testVscode = {
    extensions: {
        all: () => new Error("not implemented")
    }
};

mockVscode(testVscode, "src/contributors.ts");
import { Contributors } from "../src/contributors";

describe('Contributors unit test', () => {
    let sandbox: any;
    let extensionsMock: any;
    let contributorsMock: any;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    after(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        extensionsMock = sandbox.mock(testVscode.extensions);
        contributorsMock = sandbox.mock(Contributors);
    });

    afterEach(() => {
        extensionsMock.verify();
        contributorsMock.verify();
    });

    describe('getSnippet', () => {
        function createCodeSnippetQuestions() : any[] {
            const questions: any[] = [];
        
            questions.push(
                {
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
                }
              );
          
            return questions;
        }
        function getSnippet(context: any) : any {
            return {
                getMessages() {
                    return messageValue;
                },
                getQuestions() {
                    return createCodeSnippetQuestions();
                },
                async getWorkspaceEdit(answers: any) {
                }
            };
        }
        const messageValue = {title: "Create a new action", 
                              description: "Select the action, target, service and the entity set you want to connect to."};

        const snippetName = "snippet_1";
        const api = {
            geCodeSnippets(context: any) {
                const snippets = new Map<string, any>();
                let snippet: any = getSnippet(context);
                snippets.set(snippetName, snippet);
                return snippets;
            },
        };
        const extensionName = "vscode-snippet-contrib";
        Contributors.add(extensionName, api);
        
        it("receives valid contributorName and snippetName ---> returns valid snippet", () => {
            const uiOptions = {
                "contributorName": extensionName,
                "snippetName": snippetName
              };
              const snippet = Contributors.getSnippet(uiOptions);
              expect(snippet.getMessages()).to.deep.equal(messageValue);
        });

        it("receives no contributorName and no snippetName ---> returns undefined snippet", () => {
            const uiOptions = {};
            const snippet = Contributors.getSnippet(uiOptions);
            // tslint:disable-next-line: no-unused-expression
            expect(snippet).to.be.undefined;
        });
    });

});

