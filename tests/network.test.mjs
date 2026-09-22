import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateGraph} from '../docs/network-model.mjs';
test('a bridge failure disconnects the destination and makes sending unavailable',()=>{
 const before=evaluateGraph();assert.equal(before.hops,3);assert.equal(before.reachable,6);
 const failed=evaluateGraph({interrupted:true});assert.deepEqual(failed.path,[]);assert.equal(failed.hops,null);assert.equal(failed.reachable,3);
});
test('an independent crossing preserves reachability after the original bridge fails',()=>{
 const result=evaluateGraph({alternate:true,interrupted:true});assert.deepEqual(result.path,['A','B','F','E']);assert.equal(result.reachable,6);
 for(let i=1;i<result.path.length;i++)assert.ok(result.edges.some(([a,b])=>[a,b].includes(result.path[i-1])&&[a,b].includes(result.path[i])));
});
test('restoring the bridge and removing the alternative restores the original state without mutation',()=>{
 const start=evaluateGraph();evaluateGraph({alternate:true,interrupted:true});evaluateGraph({alternate:true});assert.deepEqual(evaluateGraph(),start);
});
