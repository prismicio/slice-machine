### protocol actions

- type: one of delete or write
- overwrite: should we overwrite when file exists?
- template: if true, CLI will render it as a Mustache template but writing the file to system
- zipPath: entry object of zip, then extracted by CLI. Possible parameter to add: `writePath` that would differ from zipPath

👆this should be re-written at some point

### templating overview

For each file, describe values it uses and _how_ it is used:

Some of them are rendered back-end only, other are rendered on both sides.
For front-end, the Mustache tags are default (curly) brackets (but square brackets on server-side).

### Problem

Some data is available server-side (custom type name for example), others are not: `magicLink`, fresh `repoName`...

### Info

If provided an `info.mustache` file, you render it with square bracket tags on server-side
and define where curly brackets are going to be used

👆it's called templating template files, and if you find a way to avoid that, it's cool

### Escape html

If you don't want to escape html (eg. when adding a path or url), prepend your variable with an &

eg:

[[ &myUrl ]]
