# Contributing

## Commit guidelines
We follow the conventional commit guidelines as specified by 
[Angular](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit). With the exception being the scope 
inside the commit message headers. For `scope` you can use either one of these scopes:
- `api` - Changes to API logic, e.g. connections and calls;
- `client` - Changes related to the ADAC client/class;
- none/empty - changes that don't fall under any of the scopes above, typically seen with type `chore` and `refactor`.

Commits **must** follow these guidelines in order for `semantic-release` to create proper automated releases. 
Furthermore, this format allows for easier to read commit history. Commits will be evaluated against the 
[default release rules](https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js) 
of `semantic-release`. This means that:
- `feat:` would be associated with a `minor` release;
- `fix:` would be associated with a `patch` release;
- If `BREAKING CHANGE` is included in the commit message, a `major` release will be triggered;
- etc.

If your commit closes/fixes any issues, please mention them in the footer of your commit message.

## Publishing a release
Publishing releases is done automatically by `semantic-release`. This means that the `"version"` inside the 
`package.json` file should **never** be updated manually as the version management is done by `semantic-release`.

A release publish is triggered by a push to the `production` branch. Merging a PR will immediately trigger this 
behaviour. This means that changes must be bundled (read 'merged') into the `master` branch first.