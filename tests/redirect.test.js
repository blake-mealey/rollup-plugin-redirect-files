import test from 'ava';
import sinon from 'sinon';
import redirect from '../src';

test.beforeEach((t) => {
  t.context.rollupContext = {
    addWatchFile: sinon.fake(),
    resolve: sinon.fake((id) => id),
  };
});

test('does not redirect non-matching files', async (t) => {
  const target = { from: 'match', to: 'redirect' };
  const plugin = redirect({
    targets: [target],
  });

  const id = 'random';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, null);
  sinon.assert.notCalled(t.context.rollupContext.resolve);
  sinon.assert.notCalled(t.context.rollupContext.addWatchFile);
});

test('redirects matching files', async (t) => {
  const target = { from: 'match', to: 'redirect' };
  const plugin = redirect({
    targets: [target],
  });

  const id = 'match';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, target.to);
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});

test('redirects matching files with capture group replacement', async (t) => {
  const target = { from: /^(first)-(second)$/, to: 'redirect-$1-$2' };
  const plugin = redirect({
    targets: [target],
  });

  const id = 'first-second';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, 'redirect-first-second');
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});

test('maps fromExt, toExt -> from, to', (t) => {
  const target = { fromExt: '.env', toExt: '.prod' };

  redirect({
    targets: [target],
  });

  t.is(target.from, '^(.*)\\.env(.*)$');
  t.is(target.to, '$1.prod$2');
});

test('normalizes and maps fromExt, toExt -> from, to', (t) => {
  const target = { fromExt: 'env', toExt: 'prod' };

  redirect({
    targets: [target],
  });

  t.is(target.from, '^(.*)\\.env(.*)$');
  t.is(target.to, '$1.prod$2');
});

test('does not redirect non-matching file extensions', async (t) => {
  const target = { fromExt: 'env', toExt: 'prod' };
  const plugin = redirect({
    targets: [target],
  });

  const id = 'file.dev';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, null);
  sinon.assert.notCalled(t.context.rollupContext.resolve);
  sinon.assert.notCalled(t.context.rollupContext.addWatchFile);
});

test('redirects matching file extensions', async (t) => {
  const target = { fromExt: 'env', toExt: 'prod' };
  const plugin = redirect({
    targets: [target],
  });

  const id = 'file.env';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, 'file.prod');
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});
