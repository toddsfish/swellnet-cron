import { javascript, typescript } from 'projen';
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'swellnet-cron',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  github: false,
  gitignore: [".env"],
  deps: [
    'crawlee',
    'playwright',
    'dotenv',
    'tslib@^2.8.1', // Using exact version that works with crawlee
  ] /* Runtime dependencies of this module. */,
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.synth();
