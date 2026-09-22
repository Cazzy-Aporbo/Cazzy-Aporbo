import {nodes,evaluateGraph} from './network-model.mjs';
const ns='http://www.w3.org/2000/svg';
const svg=document.querySelector('#network-svg');
const edgeGroup=document.querySelector('#graph-edges');
const nodeGroup=document.querySelector('#graph-nodes');
const route=document.querySelector('#graph-route');
const packet=document.querySelector('#graph-packet');
const alternateButton=document.querySelector('#alternate');
const interruptButton=document.querySelector('#interrupt');
const sendButton=document.querySelector('#send-signal');
const reading=document.querySelector('#network-reading');
const state={alternate:false,interrupted:false};
const byId=new Map(nodes.map(n=>[n.id,n]));
function element(tag,attrs={}) {const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
for(const n of nodes){
  const g=element('g');
  g.append(element('circle',{cx:n.x,cy:n.y,r:26,class:'node-halo'}),element('circle',{cx:n.x,cy:n.y,r:5,class:'node-core'}));
  const label=element('text',{x:n.x,y:n.y+49,class:'node-label'});label.textContent=n.id;g.append(label);nodeGroup.append(g);
}
function routePath(path){return path.map((id,i)=>{const n=byId.get(id);return`${i?'L':'M'}${n.x} ${n.y}`;}).join(' ');}
function resetPacket(){packet.replaceChildren();packet.setAttribute('cx','90');packet.setAttribute('cy','155');}
function render(){
  resetPacket();const graph=evaluateGraph(state);edgeGroup.replaceChildren();
  for(const[a,b]of graph.edges){const p=byId.get(a),q=byId.get(b);edgeGroup.append(element('path',{d:`M${p.x} ${p.y}L${q.x} ${q.y}`,class:a==='B'&&b==='F'?'alternative-edge':'normal-edge'}));}
  if(state.interrupted)edgeGroup.append(element('path',{d:'M235 250L580 155',class:'interrupted-edge'}));
  route.setAttribute('d',routePath(graph.path));
  alternateButton.setAttribute('aria-pressed',String(state.alternate));interruptButton.setAttribute('aria-pressed',String(state.interrupted));
  alternateButton.textContent=state.alternate?'Remove the alternative path':'Add an alternative path';
  interruptButton.textContent=state.interrupted?'Restore C–D':'Interrupt C–D';
  document.querySelector('#network-state').textContent=graph.hops===null?'A → E · no route':`A → E · ${graph.hops} hops`;
  sendButton.disabled=!graph.path.length;
  reading.textContent=!graph.path.length?'The groups have separated. A reaches only A, B and C. Add an alternative path or restore the crossing.':state.interrupted?'A → B → F → E. The alternative crossing keeps a route open while C–D is interrupted.':state.alternate?'Two crossings now connect the groups. Interrupt C–D to see which route remains.':'A → C → D → E. The crossing C–D is a bridge: remove it and these two groups separate.';
  document.querySelector('#network-desc').textContent=`Six-node graph. ${graph.path.length?'Route '+graph.path.join(' to ')+', '+graph.hops+' hops.':'No route from A to E.'} ${graph.reachable} nodes reachable from A.`;
}
alternateButton.disabled=false;interruptButton.disabled=false;
alternateButton.addEventListener('click',()=>{state.alternate=!state.alternate;render();});
interruptButton.addEventListener('click',()=>{state.interrupted=!state.interrupted;render();});
sendButton.addEventListener('click',()=>{
  const graph=evaluateGraph(state);if(!graph.path.length)return;resetPacket();
  if(document.body.classList.contains('paused')||matchMedia('(prefers-reduced-motion: reduce)').matches){packet.setAttribute('cx','735');packet.setAttribute('cy','65');}
  else{packet.setAttribute('cx','0');packet.setAttribute('cy','0');const motion=element('animateMotion',{path:routePath(graph.path),dur:'2.4s',repeatCount:'1',fill:'freeze',begin:'indefinite'});packet.append(motion);motion.beginElement();}
  reading.textContent=`Signal route: ${graph.path.join(' → ')}. ${graph.hops} hops. The animation is illustrative; hop count is not elapsed time.`;
});
function syncMotion(){if(document.hidden||document.body.classList.contains('paused')||matchMedia('(prefers-reduced-motion: reduce)').matches)svg.pauseAnimations();else svg.unpauseAnimations();}
document.querySelector('#motion').addEventListener('click',syncMotion);
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncMotion);
document.addEventListener('visibilitychange',syncMotion);
render();syncMotion();
