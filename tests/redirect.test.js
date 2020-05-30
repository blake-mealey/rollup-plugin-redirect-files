import test, { todo } from 'ava';
import sinon from 'sinon';
import redirect from '../src';

test.beforeEach(t => {
  t.context.rollupContext = {
    addWatchFile: sinon.fake(),
    resolve: sinon.fake(id => id),
  };

  sinon.spy(console, 'log');
});

test.afterEach(() => {
  delete console.log;
});

test('does not redirect non-matching files', async t => {
  const target = { from: 'match', to: 'redirect' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'random';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, null);
  sinon.assert.notCalled(t.context.rollupContext.resolve);
  sinon.assert.notCalled(t.context.rollupContext.addWatchFile);
});

test('redirects matching files', async t => {
  const target = { from: 'match', to: 'redirect' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'match';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, target.to);
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});

test('redirects matching files with capture group replacement', async t => {
  const target = { from: /^(first)-(second)$/, to: 'redirect-$1-$2' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'first-second';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, 'redirect-first-second');
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});

test('does not redirect non-matching file extensions', async t => {
  const target = { fromExt: '.env', toExt: '.prod' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'file.dev';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, null);
  sinon.assert.notCalled(t.context.rollupContext.resolve);
  sinon.assert.notCalled(t.context.rollupContext.addWatchFile);
});

test('redirects matching file extensions', async t => {
  const target = { fromExt: '.env', toExt: '.prod' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'file.env';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, 'file.prod');
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});

test('normalizes and redirects matching file extensions', async t => {
  const target = { fromExt: 'env', toExt: 'prod' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'file.env';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, 'file.prod');
  sinon.assert.calledWithExactly(t.context.rollupContext.resolve, newId, importer);
  sinon.assert.calledWithExactly(t.context.rollupContext.addWatchFile, newId);
});

todo('redirects multiple targets');
todo('redirects multiple matches');
todo('redirects nothing with empty targets');
todo('redirects nothing with null options');
todo('redirects nothing with empty options');

test('non-verbose mode does not log to the console', async t => {
  const target = { from: 'match', to: 'redirect' };
  const plugin = redirect({
    targets: [target]
  });

  const id = 'match';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, target.to);
  sinon.assert.notCalled(console.log);
});

test('verbose mode logs to the console', async t => {
  const target = { from: 'match', to: 'redirect' };
  const plugin = redirect({
    targets: [target],
    verbose: true
  });

  const id = 'match';
  const importer = 'importer.js';
  const newId = await plugin.resolveId.apply(t.context.rollupContext, [id, importer]);

  t.is(newId, target.to);
  sinon.assert.called(console.log);
});
