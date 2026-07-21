const test=require('node:test'),assert=require('node:assert/strict');const {interval,unsupportedClaim,finite,requireRole}=require('../lib/forecastPolicy');
test('uncertainty contains point estimate',()=>{assert.deepEqual(interval(2,1,3),{point:2,lower:1,upper:3});assert.throws(()=>interval(4,1,3),/contain/);});
test('blocks unsupported operational claims',()=>{assert.equal(unsupportedClaim('guaranteed safe to operate'),true);assert.equal(unsupportedClaim('median projection with uncertainty'),false);});
test('rejects non-finite metrics',()=>assert.throws(()=>finite(Infinity,'rmse'),/finite/));
test('requires an independent publishing role',()=>assert.throws(()=>requireRole('analyst',['reviewer']),/Reviewer/));
