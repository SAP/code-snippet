export default {
  channelName: "Snippets",
  title: "Code Snippet",
  description: `code-snippet description.`,
  applyButton: "Apply",
  noResponse: "No response received.",
  snippetMustExist: "Snippet must exist",
  could_not_initialize: "Could not initialize code-snippet webview",
  could_not_update: (
    methodName: string,
    questionName: string,
    namespace: string
  ): string =>
    `Could not update method '${methodName}' in '${questionName}' question in generator '${namespace}'`,
};
