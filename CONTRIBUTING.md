# Branching Model

Inspired by [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/)

## Development

- General development takes place on `develop` branch.
- Features are branched off and merged back to `develop`.
- Naming convention: `{issue-id}/{name-of-feature}`.
  - e.g. `1333/loading_issues`
- Merging back to `develop` occurs in the form of a pull request requiring a code review.
- The tests on `develop` branch should pass at all times. A developer who makes test-breaking changes must resolve them as soon as possible.

## Release

- We create a release branch from `develop`
- Naming convention: `release/{vSEM.VERSION.NUMBER}`.
  - e.g. `release/v1.6.0`
- This branch is still open for minor changes (e.g. bumping the version before release.)
- For release the `release` branch is merged into the `master` branch.
- The commit on the master branch should be tagged - this can be done through GitHub at the same time as officially creating a release at https://github.com/jolocom/smartwallet-app/releases
- Don't forget to merge the release branch back into the `develop` branch.

## Hotfixes for Production

- Bugs on `master` branch are fixed in a separate `hotfix` branch that branches off master.
- Naming convention: `hotfix/{name-of-fix}`.
  - e.g `hotfix/version_alignment`
- Don't forget to merge the hotfix branch back into the `develop` branch.


# Conventions

## Coding standards

- We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to maintain a consistent style across the codebase.
- ESLint and Prettier configuration files are included, as well as the prerequisite devDependencies in `package.json`.
- Your text editor/IDE should have plugins for these two tools.
- Your editor may also have the option to run Prettier formatting on save.
- The `yarn format` script is provided to run ESLint and Prettier rules on the codebase, auto-fixing where possible.

## Commit messages

  - Title is short and references GitHub issue # if appropriate.
  - Description is as descriptive as necessary so there is nothing unexpected introduced in the commit.
