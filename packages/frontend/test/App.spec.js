import { initComponent, destroy } from "./Utils";
import App from "../src/App.vue";
import Vue from "vue";
import Vuetify from "vuetify";
import { WebSocket } from "mock-socket";

Vue.use(Vuetify);
global.WebSocket = WebSocket;

let wrapper;

describe("App.vue", () => {
  afterEach(() => {
    destroy(wrapper);
  });

  it("createPrompt - method", () => {
    wrapper = initComponent(App, {}, true);
    expect(wrapper.vm.createPrompt().name).toBe();
    expect(wrapper.vm.createPrompt([]).name).toBe();
    expect(wrapper.vm.createPrompt([], "select_generator")).toBeDefined();
  });

  describe("currentPrompt - computed", () => {
    it("questions are not defined", () => {
      wrapper = initComponent(App, {});
      wrapper.vm.prompts = [{}, {}];
      wrapper.vm.promptIndex = 1;
      expect(wrapper.vm.currentPrompt.answers).toBeUndefined();
    });
  });

  describe("showPrompt - method", () => {
    it("set props", async () => {
      wrapper = initComponent(App, {}, true);
      wrapper.vm.rpc = {
        invoke: jest.fn().mockImplementation((...args) => {
          return args[1][1];
        }),
      };
      const questions = [
        { name: "defaultQ", default: "__Function" },
        { name: "whenQ", when: "__Function" },
        { name: "messageQ", message: "__Function" },
        { name: "choicesQ", choices: "__Function" },
        { name: "filterQ", filter: "__Function" },
        { name: "validateQ", validate: "__Function" },
        { name: "whenQ6", default: "whenAnswer6", type: "confirm" },
      ];
      wrapper.vm.showPrompt(questions);
      await Vue.nextTick();
      let response = await questions[0].default();
      expect(response).toBe(questions[0].name);

      response = await questions[1].when();
      expect(response).toBe(questions[1].name);

      response = await questions[2].message();
      expect(response).toBe(questions[2].name);

      response = await questions[3].choices();
      expect(response).toBe(questions[3].name);

      response = await questions[4].filter();
      expect(response).toBe(questions[4].name);

      response = await questions[5].validate();
      expect(response).toBe(questions[5].name);
    });

    it("method that doesn't exist", async () => {
      wrapper = initComponent(App, {}, true);
      wrapper.vm.rpc = {
        invoke: jest.fn().mockImplementation(async () => {
          throw "error";
        }),
      };

      const questions = [{ name: "validateQ", validate: "__Function" }];
      wrapper.vm.prepQuestions(questions, "promptName");
      await expect(questions[0].validate()).rejects.toEqual("error");
    });

    // the delay ensures we call the busy indicator
    it("validate() with delay", async () => {
      wrapper = initComponent(App, {}, true);
      wrapper.vm.rpc = {
        invoke: jest.fn().mockImplementation(async (...args) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(args[1][1]);
            }, 1500);
          });
        }),
      };

      wrapper.vm.prompts = [{}, { name: "Loading..." }];
      wrapper.vm.promptIndex = 1;

      const questions = [{ name: "validateQ", validate: "__Function" }];
      wrapper.vm.showPrompt(questions);
      await Vue.nextTick();

      const response = await questions[0].validate();
      expect(response).toBe(questions[0].name);
    });
  });

  it("initRpc - method", () => {
    wrapper = initComponent(App, {}, true);
    wrapper.vm.rpc = {
      invoke: jest.fn(),
      registerMethod: jest.fn(),
    };

    wrapper.vm.showPrompt = jest.fn();
    wrapper.vm.setPrompts = jest.fn();
    wrapper.vm.snippetDone = jest.fn();
    wrapper.vm.log = jest.fn();

    const invokeSpy = jest.spyOn(wrapper.vm.rpc, "invoke");
    const registerMethodSpy = jest.spyOn(wrapper.vm.rpc, "registerMethod");
    wrapper.vm.initRpc();

    expect(registerMethodSpy).toHaveBeenCalledWith({
      func: wrapper.vm.showPrompt,
      thisArg: wrapper.vm,
      name: "showPrompt",
    });
    expect(registerMethodSpy).toHaveBeenCalledWith({
      func: wrapper.vm.snippetDone,
      thisArg: wrapper.vm,
      name: "snippetDone",
    });
    expect(registerMethodSpy).toHaveBeenCalledWith({
      func: wrapper.vm.log,
      thisArg: wrapper.vm,
      name: "log",
    });
    expect(invokeSpy).toHaveBeenCalledWith("getState");

    invokeSpy.mockRestore();
    registerMethodSpy.mockRestore();
  });

  it("log - method", () => {
    wrapper = initComponent(App, {}, true);
    wrapper.vm.logText = "test_";

    wrapper.vm.log("test_log");

    expect(wrapper.vm.logText).toBe("test_test_log");
  });

  describe("setPromptList - method", () => {
    it("prompts is empty array", () => {
      wrapper = initComponent(App);

      wrapper.vm.prompts = [{}, {}];
      wrapper.vm.promptIndex = 1;
      wrapper.vm.currentPrompt.status = "pending";

      wrapper.vm.setPromptList([]);

      expect(wrapper.vm.prompts).toHaveLength(2);
    });

    it("prompts is undefined", () => {
      wrapper = initComponent(App);

      wrapper.vm.prompts = [{}, {}];
      wrapper.vm.promptIndex = 1;
      wrapper.vm.currentPrompt.status = "pending";

      wrapper.vm.setPromptList();

      expect(wrapper.vm.prompts).toHaveLength(2);
    });
  });

  describe("snippetDone - method", () => {
    test("status is pending", () => {
      wrapper = initComponent(App, { donePath: "testDonePath" });
      wrapper.vm.prompts = [{}, {}];
      wrapper.vm.promptIndex = 1;
      wrapper.vm.currentPrompt.status = "pending";

      wrapper.vm.snippetDone(true, "testMessage", "/test/path");

      expect(wrapper.vm.doneMessage).toBe("testMessage");
      expect(wrapper.vm.donePath).toBe("/test/path");
      expect(wrapper.vm.isDone).toBeTruthy();
      expect(wrapper.vm.currentPrompt.name).toBe("Summary");
    });
  });

  describe("setBusyIndicator - method", () => {
    it("prompts is empty", () => {
      wrapper = initComponent(App);
      wrapper.vm.prompts = [];
      wrapper.vm.setBusyIndicator();
      expect(wrapper.vm.showBusyIndicator).toBeTruthy();
    });

    it("isDone is false, status is pending, prompts is not empty", () => {
      wrapper = initComponent(App);
      wrapper.vm.prompts = [{}, {}];
      wrapper.vm.isDone = false;
      wrapper.vm.currentPrompt.status = "pending";
      wrapper.vm.setBusyIndicator();
      expect(wrapper.vm.showBusyIndicator).toBeTruthy();
    });

    it("isDone is true, status is pending, prompts is not empty", () => {
      wrapper = initComponent(App);
      wrapper.vm.prompts = [{}, {}];
      wrapper.vm.isDone = true;
      wrapper.vm.currentPrompt.status = "pending";
      wrapper.vm.setBusyIndicator();
      expect(wrapper.vm.showBusyIndicator).toBeFalsy();
    });
  });

  describe("toggleConsole - method", () => {
    it("showConsole property updated from toggleConsole()", () => {
      wrapper = initComponent(App, {}, true);
      wrapper.vm.toggleConsole();
      expect(wrapper.vm.showConsole).toBeTruthy();
      wrapper.vm.toggleConsole();
      expect(wrapper.vm.showConsole).toBeFalsy();
    });
  });

  describe("init - method", () => {
    it("isInVsCode = true", () => {
      wrapper = initComponent(App);

      wrapper.vm.isInVsCode = jest.fn().mockReturnValue(true);
      wrapper.vm.init();

      expect(wrapper.vm.promptIndex).toBe(0);
      expect(wrapper.vm.prompts).toStrictEqual([]);
      expect(wrapper.vm.consoleClass).toBe("consoleClassHidden");
    });

    it("isInVsCode = false", () => {
      wrapper = initComponent(App);

      wrapper.vm.isInVsCode = jest.fn().mockReturnValue(false);
      wrapper.vm.init();

      expect(wrapper.vm.consoleClass).toBe("consoleClassVisible");
    });
  });

  it("reload - method", () => {
    wrapper = initComponent(App);

    wrapper.vm.rpc = {
      invoke: jest.fn(),
      registerMethod: jest.fn(),
    };
    const invokeSpy = jest.spyOn(wrapper.vm.rpc, "invoke");

    wrapper.vm.init = jest.fn();
    const initSpy = jest.spyOn(wrapper.vm, "init");

    wrapper.vm.reload();

    expect(initSpy).toHaveBeenCalled();
    expect(invokeSpy).toHaveBeenCalledWith("getState");

    invokeSpy.mockRestore();
  });

  it("executeCommand - method", () => {
    wrapper = initComponent(App, {}, true);
    wrapper.vm.rpc = {
      invoke: jest.fn(),
    };

    const event = {
      target: {
        getAttribute: jest.fn().mockImplementation((key) => {
          return key === "command"
            ? "vscode.open"
            : key === "params"
            ? ["param"]
            : "";
        }),
      },
    };
    const invokeSpy = jest.spyOn(wrapper.vm.rpc, "invoke");
    wrapper.vm.executeCommand(event);

    expect(invokeSpy).toHaveBeenCalledWith("executeCommand", [
      "vscode.open",
      ["param"],
    ]);

    invokeSpy.mockRestore();
  });
});
