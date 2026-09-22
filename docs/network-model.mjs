// A small public teaching model. It describes reachability, not a deployed system.
export const nodes = Object.freeze([
  {id:'A',x:90,y:155}, {id:'B',x:235,y:65}, {id:'C',x:235,y:250},
  {id:'D',x:580,y:155}, {id:'E',x:735,y:65}, {id:'F',x:735,y:250}
]);
const base = [['A','B'],['A','C'],['B','C'],['C','D'],['D','E'],['D','F'],['E','F']];
export function evaluateGraph({alternate=false,interrupted=false}={}) {
  const edges = base.filter(([a,b]) => !(interrupted && a==='C' && b==='D'));
  if (alternate) edges.push(['B','F']);
  const adjacent = new Map(nodes.map(n => [n.id, []]));
  for (const [a,b] of edges) { adjacent.get(a).push(b); adjacent.get(b).push(a); }
  const previous = new Map([['A',null]]);
  const queue = ['A'];
  for (let head=0; head<queue.length; head++) {
    for (const next of adjacent.get(queue[head])) {
      if (!previous.has(next)) { previous.set(next,queue[head]); queue.push(next); }
    }
  }
  const path=[];
  if (previous.has('E')) {
    for (let current='E';current!==null;current=previous.get(current)) path.unshift(current);
  }
  return {edges,path,reachable:queue.length,hops:path.length ? path.length-1 : null};
}
