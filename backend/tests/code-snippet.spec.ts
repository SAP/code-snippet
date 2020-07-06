import * as mocha from "mocha";
import * as sinon from "sinon";
const datauri = require("datauri");
import * as fsextra from "fs-extra";
import { expect } from "chai";
import * as _ from "lodash";
import * as path from "path";
import {CodeSnippet} from "../src/code-snippet";
import * as yeomanEnv from "yeoman-environment";
import { AppLog } from "../src/app-log";
import { AppEvents } from '../src/app-events';
import { IMethod, IPromiseCallbacks, IRpc } from "@sap-devx/webview-rpc/out.ext/rpc-common";
import { IChildLogger } from "@vscode-logging/logger";
import * as os from "os";
import { fail } from "assert";
import Environment = require("yeoman-environment");

describe('codeSnippet unit test', () => {
    let sandbox: any;
    let yeomanEnvMock: any;
    let fsExtraMock: any;
    let datauriMock: any;
    let loggerMock: any;
    let rpcMock: any;
    let appEventsMock: any;
    const UTF8: string = "utf8";
    const PACKAGE_JSON: string = "package.json";

    const choiceMessage = 
        "Some quick example text of the codeSnippet description. This is a long text so that the example will look good.";
    class TestEvents implements AppEvents {
        public async doApply(we: any): Promise<any> {
            return;
        }
        public doSnippeDone(success: boolean, message: string, targetPath?: string): void {
            return;
        }
    }
    class TestRpc implements IRpc {
        public  timeout: number;
        public promiseCallbacks: Map<number, IPromiseCallbacks>;
        public methods: Map<string, IMethod>;
        public sendRequest(): void {
            return;
        }            
        public sendResponse(): void {
            return;
        } 
        public setResponseTimeout(): void {
            return;
        }
        public registerMethod(): void {
            return;
        } 
        public unregisterMethod(): void {
            return;
        } 
        public listLocalMethods(): string[] {
            return [];
        }
        public handleResponse(): void {
            return;
        } 
        public listRemoteMethods(): Promise<string[]> {
            return Promise.resolve([]);
        }
        public invoke(): Promise<any> {
            return Promise.resolve();
        }
        public handleRequest(): Promise<void> {
            return Promise.resolve();
        }
    }
    class TestOutputChannel implements AppLog {
        public log(): void {
            return;
        }            
        public writeln(): void {
            return;
        } 
        public create(): void {
            return;
        }  
        public force(): void {
            return;
        } 
        public conflict(): void {
            return;
        }  
        public identical(): void {
            return;
        }  
        public skip(): void {
            return;
        } 
        public showOutput(): boolean {
            return false;
        }  
    }

    const testLogger = {debug: () => {}, error: () => {}, fatal: () => {}, warn: () => {}, info: () => {}, trace: () => {}, getChildLogger: () => ({} as IChildLogger)};

    const rpc = new TestRpc();
    const outputChannel = new TestOutputChannel();
    const appEvents = new TestEvents();
    const uiOptions = {messages: {title: "snippet title"}};
    const codeSnippet: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, uiOptions);

    before(() => {
        sandbox = sinon.createSandbox();
    });

    after(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        yeomanEnvMock = sandbox.mock(yeomanEnv);
        fsExtraMock = sandbox.mock(fsextra);
        datauriMock = sandbox.mock(datauri);
        rpcMock = sandbox.mock(rpc);
        loggerMock = sandbox.mock(testLogger);
        appEventsMock = sandbox.mock(appEvents);
    });

    afterEach(() => {
        yeomanEnvMock.verify();
        fsExtraMock.verify();
        datauriMock.verify();
        rpcMock.verify();
        loggerMock.verify();
        appEventsMock.verify();
    });

    it("constructor", () => {
        try {
            // tslint:disable-next-line: no-unused-expression
            new CodeSnippet(undefined, undefined, undefined, undefined, undefined);
            fail("contructor should throw an exception");
        } catch (error) {
            expect(error.message).to.be.equal("rpc must be set");
        }
    });

    it("getState", async () => {
        const state = await codeSnippet["getState"]();
        expect(state).to.deep.equal(uiOptions);
    });

    describe("receiveIsWebviewReady", () => {
        it("flow is successfull", async () => {
            rpcMock.expects("invoke").withArgs("showPrompt").resolves(
                {actionName: "actionName"},
                {actionTemplate: "OData action"},
                {actionType: "Create entity"});
            appEventsMock.expects("doApply");
            await codeSnippet["receiveIsWebviewReady"]();
        });

        it("no prompt ---> an error is thrown", async () => {
            loggerMock.expects("error");
            appEventsMock.expects("doApply").never();
            await codeSnippet["receiveIsWebviewReady"]();
        });

        it("prompt throws exception ---> an error is thrown", async () => {
            rpcMock.expects("invoke").withArgs("showPrompt").rejects(new Error());
            loggerMock.expects("error");
            appEventsMock.expects("doApply").never();
            await codeSnippet["receiveIsWebviewReady"]();
        });
    });

    describe("showPrompt", () => {
        it("prompt without questions", async () => {
            const answers = await codeSnippet.showPrompt([]);
            // tslint:disable-next-line: no-unused-expression
            expect(answers).to.be.empty;
        });
    });

    describe("funcReplacer", () => {
        it("with function", () => {
            const res = CodeSnippet["funcReplacer"]("key", () => { return; });
            // tslint:disable-next-line: no-unused-expression
            expect(res).to.be.equal("__Function");
        });

        it("without function", () => {
            const res = CodeSnippet["funcReplacer"]("key", "value");
            // tslint:disable-next-line: no-unused-expression
            expect(res).to.be.equal("value");
        });
    });

    it("toggleOutput", () => {
        const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
        const res = codeSnippetInstance["toggleOutput"]();
        // tslint:disable-next-line: no-unused-expression
        expect(res).to.be.false;
    });

    it("getErrorInfo", () => {
        const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
        const errorInfo: string = "Error Info";
        const res = codeSnippetInstance["getErrorInfo"](errorInfo);
        // tslint:disable-next-line: no-unused-expression
        expect(res).to.be.equal(errorInfo);
    });

    describe("answersUtils", () => {
        it("setDefaults", () => {
            const questions = [
                {name: "q1", default: "a"},
                {name: "q2", default: () => { return "b";}},
                {name: "q3"}
            ];
            const answers = {
                q1: "x",
                q2: "y",
                q3: "z"
            };
            for (const index in questions) {
                const question = questions[index];
                switch (question.name) {
                    case "a":
                        expect((question as any)["answer"]).to.equal("x");
                        break;
                    case "b":
                        expect((question as any)["answer"]).to.equal("y");
                        break;
                    case "c":
                        expect((question as any)["answer"]).to.equal("z");
                        break;
                }
            }
        });
    });

    describe("showPrompt", async () => {
        it("returns answers", async () => {
            const firstName = "john";
            rpc.invoke = async () => {
                return {
                    firstName,
                    lastName: "doe"
                };
            };
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
            const questions = [{name: "q1"}];
            const response = await codeSnippetInstance.showPrompt(questions);
            expect (response.firstName).to.equal(firstName);
        });

    });

    describe("onSuccess - onFailure", () => {
        let doSnippeDoneSpy: any;

        beforeEach(() => {
            doSnippeDoneSpy = sandbox.spy(appEvents, "doSnippeDone");
        });

        afterEach(() => {
            doSnippeDoneSpy.restore();
        });

        it("onSuccess", () => {
            codeSnippet["onSuccess"]("testSnippetName");
            // tslint:disable-next-line: no-unused-expression
            expect(doSnippeDoneSpy.calledWith(true, "'testSnippetName' snippet has been created.")).to.be.true;
        });

        it("onFailure", async () => {
            await codeSnippet["onFailure"]("testSnippetName", "testError");
            // tslint:disable-next-line: no-unused-expression
            expect(doSnippeDoneSpy.calledWith(false, "testSnippetName snippet failed.\ntestError")).to.be.true;
        });
    });

    describe("Custom Question Event Handlers", async () => {
        it("addCustomQuestionEventHandlers()", async () => {
            const testEventFunction = () => {
                return true;
            };
            const questions = [
                {
                    name:"q1",
                    guiType: "questionType"
                }
            ];
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});

            codeSnippetInstance["addCustomQuestionEventHandlers"](questions);
            expect(questions[0]).to.not.have.property("testEvent");

            codeSnippetInstance.registerCustomQuestionEventHandler("questionType", "testEvent", testEventFunction);
            codeSnippetInstance["addCustomQuestionEventHandlers"](questions);
            expect(questions[0]).to.have.property("testEvent");
            expect((questions[0] as any)["testEvent"]).to.equal(testEventFunction);
        });
    });

    describe("evaluateMethod()", async () => {
        it("custom question events", async () => {
            const testEventFunction = () => {
                return true;
            };
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
            codeSnippetInstance.registerCustomQuestionEventHandler("questionType", "testEvent", testEventFunction);
            codeSnippetInstance["currentQuestions"] = [{name:"question1", guiType: "questionType"}];
            const response = await codeSnippetInstance["evaluateMethod"](null, "question1", "testEvent");
            // tslint:disable-next-line: no-unused-expression
            expect(response).to.be.true;
        });

        it("question method is called", async () => {
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
            codeSnippetInstance["currentQuestions"] = [{name:"question1", method1:()=>{
                return true;
            }}];
            const response = await codeSnippetInstance["evaluateMethod"](null, "question1", "method1");
            // tslint:disable-next-line: no-unused-expression
            expect(response).to.be.true;
        });

        it("no relevant question", async () => {
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
            codeSnippetInstance["currentQuestions"] = [{name:"question1", method1:()=>{
                return true;
            }}];
            const response = await codeSnippetInstance["evaluateMethod"](null, "question2", "method2");
            // tslint:disable-next-line: no-unused-expression
            expect(response).to.be.undefined;
        });

        it("no questions", async () => {
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
            const response = await codeSnippetInstance["evaluateMethod"](null, "question1", "method1");
            // tslint:disable-next-line: no-unused-expression
            expect(response).to.be.undefined;
        });

        it("method throws exception", async () => {
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});
            codeSnippetInstance["gen"] = Object.create({});
            codeSnippetInstance["gen"].options = {};
            codeSnippetInstance["currentQuestions"] = [{name:"question1", method1:()=>{
                throw new Error("Error");
            }}];
            try {
                await codeSnippetInstance["evaluateMethod"](null, "question1", "method1");
            } catch(e) {
                expect(e.toString()).to.contain("method1");
            }
        });
    });

    describe("applyCode", () => {
        const title = "snippet title";
        let codeSnippetInstanceMock:any;
        let codeSnippetInstance: CodeSnippet;

        beforeEach(() => {
            codeSnippetInstance = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {messages: {title: title}});
            codeSnippetInstanceMock = sandbox.mock(codeSnippetInstance);
        });

        afterEach(() => {
            codeSnippetInstanceMock.verify();
        });

        it("createCodeSnippetWorkspaceEdit succeeds ---> onSuccess is called", async () => {
            const onSuccessSpy = sandbox.spy(codeSnippetInstance, "onSuccess");
            codeSnippetInstanceMock.expects("createCodeSnippetWorkspaceEdit").resolves();
            await codeSnippetInstance["applyCode"]({});
            // tslint:disable-next-line: no-unused-expression
            expect(onSuccessSpy.calledWith(title)).to.be.true;
            onSuccessSpy.restore();
        });

        it("createCodeSnippetWorkspaceEdit fails ---> onFailure is called", async () => {
            const onFailureSpy = sandbox.spy(codeSnippetInstance, "onFailure");
            const error = new Error("error");
            codeSnippetInstanceMock.expects("createCodeSnippetWorkspaceEdit").rejects(error);
            await codeSnippetInstance["applyCode"]({});
            // tslint:disable-next-line: no-unused-expression
            expect(onFailureSpy.calledWith(title, error)).to.be.true;
            onFailureSpy.restore();
        });
    });
    
    const snippet: any = {
        getMessages() {
            return "getMessages";
        },
        getQuestions() {
            return "createCodeSnippetQuestions";
        },
        async getWorkspaceEdit(answers: any, context: any) {
            return "getWorkspaceEdit";
        }
    };

    describe("createCodeSnippetWorkspaceEdit", () => {
        it("snippet has getWorkspaceEdit ---> call getWorkspaceEdit", async () => {
            const myCodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {snippet: snippet});
            const we = await myCodeSnippet["createCodeSnippetWorkspaceEdit"]({});
            expect(we).to.be.equal("getWorkspaceEdit");
        });
    });

    describe("createCodeSnippetQuestions", () => {
        it("snippet has getQuestions ---> call getQuestions", async () => {
            const myCodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {snippet: snippet});
            const we = await myCodeSnippet["createCodeSnippetQuestions"]();
            expect(we).to.be.equal("createCodeSnippetQuestions");
        });
    });

    describe("registerCustomQuestionEventHandler", () => {
        it("all the events handlers for the same question type are in the same entry", () => {
            const testEventFunction = () => {
                return true;
            };
            const codeSnippetInstance: CodeSnippet = new CodeSnippet(rpc, appEvents, outputChannel, testLogger, {});

            codeSnippetInstance.registerCustomQuestionEventHandler("questionType", "testEvent1", testEventFunction);
            expect(codeSnippetInstance["customQuestionEventHandlers"].size).to.be.equal(1);

            codeSnippetInstance.registerCustomQuestionEventHandler("questionType", "testEvent2", testEventFunction);  
            expect(codeSnippetInstance["customQuestionEventHandlers"].size).to.be.equal(1);

        });
    });
});
