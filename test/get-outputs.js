'use strict';

const proxyquire = require('proxyquire');
const test = require('ava');
const sinon = require('sinon');

test('returns a promise', t => {
  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': () => Promise.resolve()
  });

  const outputs = getOutputs('dir', {
    _: ['foo', 'bar']
  });

  t.true(outputs instanceof Promise);
});

test('calls runTerraform', t => {
  const runTerraform = sinon.stub().resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar']
  })
  .then(() => {
    t.true(runTerraform.calledOnce);
  });
});

test('calls runTerraform for auto init', t => {
  const runTerraform = sinon.stub().onCall(0).resolves().onCall(1).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['auto-init']: true
  })
  .then(() => {
    t.true(runTerraform.calledTwice);
  });
});

test('calls runTerraform for check plan', t => {
  const runTerraform = sinon.stub().onCall(0).resolves().onCall(1).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['check-plan']: true
  })
  .then(() => {
    t.true(runTerraform.calledTwice);
  });
});

test('calls runTerraform for auto-init and check plan', t => {
  const runTerraform = sinon.stub()
    .onCall(0).resolves()
    .onCall(1).resolves()
    .onCall(2).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['auto-init']: true,
    ['check-plan']: true,
  })
  .then(() => {
    t.true(runTerraform.calledThrice);
  });
});

test('parses terraform output', t => {
  const runTerraform = sinon.stub().resolves({ output: '{"test":{"value":1}}' });

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar']
  })
  .then(result => {
    t.true(result.test === 1);
  });
});
