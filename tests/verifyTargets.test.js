import test from 'ava';
import redirect from '../src';
import {
    missingFrom,
    tooManyFroms,
    missingToForFrom,
    toExtNotAllowedForFrom,
    missingToExtForFromExt,
    toNotAllowedForFromExt
} from '../src/errorMessages';

test(`target requires from or fromExt`, t => {
    const target = {};

    const error = t.throws(() => redirect({
        targets: [ target ]
    }));

    t.is(error.message, missingFrom(target));
});

test(`target does not allow both from and fromExt`, t => {
    const target = { from: ``, fromExt: `` };

    const error = t.throws(() => redirect({
        targets: [ target ]
    }));

    t.is(error.message, tooManyFroms(target));
});

test(`target requires to for from`, t => {
    const target = { from: `` };

    const error = t.throws(() => redirect({
        targets: [ target ]
    }));

    t.is(error.message, missingToForFrom(target));
});

test(`target does not allow toExt for from`, t => {
    const target = { from: ``, to: ``, toExt: `` };

    const error = t.throws(() => redirect({
        targets: [ target ]
    }));

    t.is(error.message, toExtNotAllowedForFrom(target));
});

test(`target requires toExt for fromExt`, t => {
    const target = { fromExt: `` };

    const error = t.throws(() => redirect({
        targets: [ target ]
    }));

    t.is(error.message, missingToExtForFromExt(target));
});

test(`target does not allow to for fromExt`, t => {
    const target = { fromExt: ``, toExt: ``, to: `` };

    const error = t.throws(() => redirect({
        targets: [ target ]
    }));

    t.is(error.message, toNotAllowedForFromExt(target));
});
