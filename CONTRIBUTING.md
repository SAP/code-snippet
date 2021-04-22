# Contribution Guide

This is the common top-level contribution guide for this monorepo.
A sub-package **may** have an additional CONTRIBUTING.md file if needed.

## Legal

All contributors must sign the DCO

- https://cla-assistant.io/SAP/code-snippet

This is managed automatically via https://cla-assistant.io/ pull request voter.

## Development Environment

### pre-requisites

- [Yarn](https://yarnpkg.com/lang/en/docs/install/) >= 1.4.2
- A [Long-Term Support version](https://nodejs.org/en/about/releases/) of node.js
- (optional) [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) for managing commit messages.
- [VSCode](https://code.visualstudio.com/) 1.39.2 or higher or [Theia](https://www.theia-ide.org/) 0.12 or higher.

### Initial Setup

- `git clone https://github.com/SAP/code-snippet.git`
- `yarn`

### Full Build

To run the full **C**ontinuous **I**ntegration build run:

- `yarn ci`

in either the top-level package or a specific subpackage.

### Commit Messages format.

This project enforces the [conventional-commits][conventional_commits] commit message format.
The possible commits types prefixes are limited to those defined by [conventional-commit-types][commit_types].
This promotes a clean project history and enabled automatically generating the changelogs.

The commit message format will be inspected both on a git pre-commit hook
and during the central CI build and will **fail the build** if the commit message format is incorrect.

It is recommended to use `git cz` to construct valid conventional commit messages.

- requires [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) to be installed.

[commit_types]: https://github.com/commitizen/conventional-commit-types/blob/master/index.json
[conventional_commits]: https://www.conventionalcommits.org/en/v1.0.0/

### Formatting.

[Prettier](https://prettier.io/) is used to ensure consistent code formatting in this repository.
This is normally transparent as it automatically activated in a pre-commit hook using [lint-staged](https://github.com/okonet/lint-staged).
However, this does mean that dev flows that do not use a full dev env (e.g editing directly on github)
may result in voter failures due to formatting errors.

### Compiling

Use the following npm scripts at the repo's **root** to compile **all** the TypeScript sub-packages.

- `yarn compile`
- `yarn compile:watch` (will watch files for changes and re-compile as needed)

These scripts may also be available inside the sub-packages. However, it is recommended to
use the top-level compilation scripts to avoid forgetting to (re-)compile a sub-package's dependencies.

#### Rapid Development Mode

Rapid Development Mode enables **quick feedback loops**
by running both the frontend (browser) and the backend (nodejs) but **without** the VSCode extension.

This is also useful due to the ease of debugging webapps in the browser
vs debugging web-views inside a VSCode extension.

TODO:

- Fix and document this dev flow...

#### Run the VSCode extension

1. Start VSCode on your local machine
1. Click on open workspace.
1. Select this repo's folder.
1. On the debug panel choose "Run Extension"
1. Click on the "Run" button.

### Testing

[Mocha][mocha] and [Chai][chai] are used for unit-testing
and [Istanbul/Nyc][istanbul] for coverage reports for the TypeScript sub-packages

[Jest][jest] is used for unit-testing and coverage reports for the Vue sub-packages.

[mocha]: https://mochajs.org/
[chai]: https://www.chaijs.com
[istanbul]: https://istanbul.js.org/
[jest]: https://jestjs.io/

- To run the tests execute `yarn test` in a specific sub-package.
- To run the tests with **coverage** run `yarn coverage` in a specific sub-package.

### Code Coverage

Code Coverage is enforced for all productive code in this mono repo.

- Specific statements/functions may be [excluded][ignore_coverage] from the report.
  - However, the reason for each exclusion must be documented.
  - Note these `/* istanbul ignore ...` comments also work in jest.

[ignore_coverage]: https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md

### Release Life-Cycle.

This monorepo uses Lerna's [Fixed/Locked][lerna-mode] which means all the sub-packages share the same version number.

[lerna-mode]: https://github.com/lerna/lerna#fixedlocked-mode-default

### Release Process

Performing a release requires push permissions to the repository.

- Ensure you are on the default branch and synced with origin.
- `yarn run release:version`
- Follow the lerna CLI instructions.
- Track the release and tag builds on circle-ci.
  - https://circleci.com/gh/SAP/code-snippet.
- Once the tag builds have successfully finished:
  - Inspect the npm registry to see the new sub packages versions.
  - Inspect the new github release and verify it contains the `.vsix` artifact.
