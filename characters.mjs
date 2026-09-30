export const CHARACTERS = [
 {id:'dog',name:'小狗阿汪',detail:'垂耳 · 薄荷摩托',fur:0xd4a465,body:0xb7864e,muzzle:0xe4c18b,ear:0x855d36,helmet:0xc66b3d,bike:0x82b8a0},
 {id:'cat',name:'橘猫小橘',detail:'尖耳 · 橘红摩托',fur:0xd9a457,body:0xc08e3a,muzzle:0xe8dcc7,ear:0xc08e3a,helmet:0x606c38,bike:0xc66b3d},
 {id:'rabbit',name:'白兔团团',detail:'长耳 · 紫色摩托',fur:0xe8dcc7,body:0xd8cdb8,muzzle:0xe8dcc7,ear:0xb08b8f,helmet:0x8e7d9e,bike:0x9a8baf},
 {id:'panda',name:'熊猫滚滚',detail:'圆耳 · 金色摩托',fur:0xe8dcc7,body:0x485246,muzzle:0xe8dcc7,ear:0x34452d,helmet:0xc08e3a,bike:0xd4b16a}
];
export function buildRider(c,T,{ball,box,cyl}){
 const rider=new T.Group();rider.position.set(0,1.25,.3);
 ball(.43,c.body,0,.42,0,rider,[.9,1.25,.8]);
 ball(.47,c.fur,0,1.05,-.13,rider,[1,1,.9]);
 ball(c.id==='dog'?.29:.24,c.muzzle,0,.89,-.5,rider,[1,.7,1]);
 ball(c.id==='rabbit'?.07:.1,c.id==='rabbit'?0xb08b8f:0x3b342b,0,.97,-.73,rider,[1,.7,.6]);
 const ears=[];
 for(const x of [-.19,.19]){
  if(c.id==='panda'){const patch=ball(.14,c.ear,x,1.09,-.5,rider,[.85,1.2,.4]);patch.rotation.z=Math.sign(x)*.3;}
  ball(.065,0x332e29,x,1.13,-.53,rider);
  ball(.02,0xe8dcc7,x-.02,1.16,-.59,rider);
 }
 for(const side of [-1,1]){
  if(c.id==='dog')ears.push(ball(.22,c.ear,side*.43,.99,-.04,rider,[.65,1.6,.7]));
  if(c.id==='rabbit'){
   const ear=new T.Group();ear.position.set(side*.3,1.53,-.1);rider.add(ear);
   ball(.2,c.fur,0,.36,0,ear,[.7,2.7,.7]);ball(.13,c.ear,0,.38,-.12,ear,[.65,2.7,.3]);ears.push(ear);
  }
  if(c.id==='cat'){
   const ear=new T.Group();ear.position.set(side*.36,1.52,-.1);ear.rotation.z=-side*.25;rider.add(ear);
   cyl(0,.2,.43,c.fur,0,.12,0,ear,3);cyl(0,.12,.25,0xb08b8f,0,.11,-.08,ear,3);ears.push(ear);
   for(const y of [.85,.93]){const whisker=box(.34,.015,.015,0x775841,side*.33,y,-.64,rider);whisker.rotation.z=side*(y-.9)*3;}
  }
  if(c.id==='panda')ears.push(ball(.19,c.ear,side*.4,1.45,-.07,rider));
  const arm=ball(.17,c.fur,side*.32,.38,-.48,rider,[.7,.7,2.3]);arm.rotation.x=.4;
  ball(.19,c.body,side*.32,-.11,.17,rider,[.7,1.1,1]);
 }
 ball(.51,c.helmet,0,1.29,-.1,rider,[1,.65,1]);box(.12,.05,.9,0xe8dcc7,0,1.61,-.1,rider);
 box(.76,.035,.12,0x775841,0,1.27,-.48,rider);
 let tail;
 if(c.id==='cat'){
  tail=new T.Group();tail.position.set(0,.28,.48);rider.add(tail);
  for(let i=0;i<6;i++)ball(.105,c.fur,.15*Math.sin(i*.65),i*.1,i*.12,tail);
 }else tail=ball(c.id==='rabbit'?.18:.22,c.body,0,.3,.46,rider,c.id==='dog'?[.65,.65,2]:[1,1,1]);
 tail.rotation.x=-.5;
 box(.46,.09,.35,c.helmet,0,.74,0,rider);
 const scarfEnd=box(.2,.06,.7,c.helmet,.22,.7,.48,rider);
 return {rider,ears,tail,scarfEnd};
}
export function portrait(c){
 const hex=n=>'#'+n.toString(16).padStart(6,'0');
 const ears=c.id==='rabbit'?'<ellipse cx="23" cy="16" rx="6" ry="15"/><ellipse cx="41" cy="16" rx="6" ry="15"/>':c.id==='cat'?'<path d="M14 30L15 7L29 24M35 24L49 7L50 30"/>':c.id==='panda'?'<circle cx="16" cy="21" r="9"/><circle cx="48" cy="21" r="9"/>':'<ellipse cx="13" cy="38" rx="8" ry="15"/><ellipse cx="51" cy="38" rx="8" ry="15"/>';
 return `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="${hex(c.id==='rabbit'||c.id==='cat'?c.fur:c.ear)}">${ears}</g><circle cx="32" cy="35" r="21" fill="${hex(c.fur)}"/><path d="M12 29Q12 10 32 10Q52 10 52 29Z" fill="${hex(c.helmet)}"/><path d="M29 11H35V28H29Z" fill="#e8dcc7"/>${c.id==='panda'?'<ellipse cx="24" cy="37" rx="7" ry="8" fill="#34452d"/><ellipse cx="40" cy="37" rx="7" ry="8" fill="#34452d"/>':''}<g fill="#34452d"><circle cx="24" cy="37" r="3"/><circle cx="40" cy="37" r="3"/></g><ellipse cx="32" cy="46" rx="11" ry="8" fill="${hex(c.muzzle)}"/><ellipse cx="32" cy="43" rx="4" ry="3" fill="#34452d"/></svg>`;
}
// Geometry belongs to each constructed model; materials come from a shared cache.
export function removeModel(model){model.removeFromParent();model.traverse(o=>{if(o.isMesh)o.geometry.dispose()})}
