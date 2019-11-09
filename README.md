# rollup-plugin-redirect-files

<p>
    <a href="https://dev.azure.com/Chimerical/rollup-plugin-redirect-files/_build/latest?definitionId=9&branchName=master" alt="Azure DevOps build">
        <img src="https://img.shields.io/azure-devops/build/Chimerical/rollup-plugin-redirect-files/9/master?logo=azure-pipelines" /></a>
    <a href="https://dev.azure.com/Chimerical/rollup-plugin-redirect-files/_build/results?buildId=216&view=ms.vss-test-web.build-test-results-tab" alt="Azure DevOps tests">
        <img src="https://img.shields.io/azure-devops/tests/Chimerical/rollup-plugin-redirect-files/9/master?logo=azure-pipelines" /></a>
    <a href="https://dev.azure.com/Chimerical/rollup-plugin-redirect-files/_build/results?buildId=216&view=codecoverage-tab" alt="Azure DevOps coverage">
        <img src="https://img.shields.io/azure-devops/coverage/Chimerical/rollup-plugin-redirect-files/9/master?logo=azure-pipelines" /></a>
    <a href="https://david-dm.org/blake-mealey/rollup-plugin-redirect-files?type=dev" alt="David">
        <img src="https://img.shields.io/david/dev/blake-mealey/rollup-plugin-redirect-files" /></a>
</p>

A Rollup.js plugin for redirecting file imports using regular expressions.

Simpler than [@rollup/plugin-alias](https://github.com/rollup/plugins/tree/master/packages/alias) for some use cases (especially redirecting file extensions for per-environment configuration files).

## Installation


```sh
# yarn
yarn add rollup-plugin-redirect-files -D
 
# npm
npm i rollup-plugin-redirect-files -D
```

## Usage

```js
// rollup.config.js
import redirect from 'rollup-plugin-redirect-files';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs'
    },
    plugins: {
        redirect({
            verbose: false, // output redirected files to console
            targets: [
                { from: '^(.*regex)[0-9]*(.*)$', to: '$1$2' }, // redirect a.regex23.b → a.regex.b
                { fromExt: 'env', toExt: 'prod' }, // redirect config.env.js → config.prod.js
                { fromExt: '.env', toExt: '.prod' }, // same thing, style choice
                { fromExt: 'env', toExt: process.env.BUILD } // run rollup with `--environment BUILD:prod`
            ]
        });
    }
};
```

Behind the scenes, `fromExt`/`toExt` are mapped to:

```js
{
    from: `^(.*)\\${fromExt}(.*)$`,
    to: `$1${toExt}$2`
}
```
