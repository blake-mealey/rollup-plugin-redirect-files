import test from 'ava';
import sinon from 'sinon';
import chalk from 'chalk';
import redirect from '../src';
import Logger from '../src/logger';

test.beforeEach(t => {
    // eslint-disable-next-line no-param-reassign
    t.context.rollupContext = {
        addWatchFile: sinon.fake(),
        resolve: sinon.fake(id => id)
    };
});

test(`does not redirect non-matching files`, async t => {
    const target = { from: `match`, to: `redirect` };
    const plugin = redirect({
        targets: [ target ]
    });

    const id = `random`;
    const importer = `importer.js`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, importer ]);

    t.is(newId, null);
    t.assert(t.context.rollupContext.resolve.notCalled);
    t.assert(t.context.rollupContext.addWatchFile.notCalled);
});

test(`redirects matching files`, async t => {
    const target = { from: `match`, to: `redirect` };
    const plugin = redirect({
        targets: [ target ]
    });

    const id = `match`;
    const importer = `importer.js`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, importer ]);

    t.is(newId, target.to);
    t.assert(t.context.rollupContext.resolve.calledWithExactly(newId, importer));
    t.assert(t.context.rollupContext.addWatchFile.calledWithExactly(newId));
});

test(`redirects matching files with capture group replacement`, async t => {
    const target = { from: /^(first)-(second)$/, to: `redirect-$1-$2` };
    const plugin = redirect({
        targets: [ target ]
    });

    const id = `first-second`;
    const importer = `importer.js`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, importer ]);

    t.is(newId, `redirect-first-second`);
    t.assert(t.context.rollupContext.resolve.calledWithExactly(newId, importer));
    t.assert(t.context.rollupContext.addWatchFile.calledWithExactly(newId));
});

test(`does not redirect non-matching file extensions`, async t => {
    const target = { fromExt: `.env`, toExt: `.prod` };
    const plugin = redirect({
        targets: [ target ]
    });

    const id = `file.dev`;
    const importer = `importer.js`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, importer ]);

    t.is(newId, null);
    t.assert(t.context.rollupContext.resolve.notCalled);
    t.assert(t.context.rollupContext.addWatchFile.notCalled);
});

test(`redirects matching file extensions`, async t => {
    const target = { fromExt: `.env`, toExt: `.prod` };
    const plugin = redirect({
        targets: [ target ]
    });

    const id = `file.env`;
    const importer = `importer.js`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, importer ]);

    t.is(newId, `file.prod`);
    t.assert(t.context.rollupContext.resolve.calledWithExactly(newId, importer));
    t.assert(t.context.rollupContext.addWatchFile.calledWithExactly(newId));
});

test(`normalizes and redirects matching file extensions`, async t => {
    const target = { fromExt: `env`, toExt: `prod` };
    const plugin = redirect({
        targets: [ target ]
    });

    const id = `file.env`;
    const importer = `importer.js`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, importer ]);

    t.is(newId, `file.prod`);
    t.assert(t.context.rollupContext.resolve.calledWithExactly(newId, importer));
    t.assert(t.context.rollupContext.addWatchFile.calledWithExactly(newId));
});

test(`verbose logs redirects`, async t => {
    const target = { fromExt: `env`, toExt: `prod` };
    const plugin = redirect({
        targets: [ target ],
        verbose: true
    });

    const log = sinon.stub(Logger, `log`);

    const id = `file.env`;
    const newId = await plugin.resolveId.apply(t.context.rollupContext, [ id, `importer.js` ]);

    t.assert(log.calledOnceWithExactly(chalk.gray.dim(`redirected`),
        chalk.yellow.bold(id), chalk.gray(`→`), chalk.yellow.bold(newId)));
    log.restore();
});

test(`non-verbose does not log redirects`, async t => {
    const target = { fromExt: `env`, toExt: `prod` };
    const plugin = redirect({
        targets: [ target ],
        verbose: true
    });

    const log = sinon.stub(Logger, `log`);

    await plugin.resolveId.apply(t.context.rollupContext, [ `file.env`, `importer.js` ]);

    t.assert(log.notCalled);
    log.restore();
});
