import * as T from './three.module.js';
import {createGame,roadPoint,roadTurn,roadIndices,roadBank} from './core.mjs';
import {CHARACTERS,buildRider,portrait,removeModel} from './characters.mjs';
const $=id=>document.getElementById(id),g=createGame();
let renderer;try{renderer=new T.WebGLRenderer({canvas:$('scene'),antialias:true})}catch(e){$('title').textContent='无法启动 3D 画面';$('description').textContent='请使用支持 WebGL 的浏览器，并开启硬件加速。';$('start').disabled=true;throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0xaaccc5);renderer.outputColorSpace=T.SRGBColorSpace;
const scene=new T.Scene();scene.fog=new T.Fog(0xaaccc5,45,150);const camera=new T.PerspectiveCamera(50,innerWidth/innerHeight,.1,230);camera.position.set(7,5.5,10);
scene.add(new T.HemisphereLight(0xe9f5e1,0x687747,2.3));const sun=new T.DirectionalLight(0xffdfac,3);sun.position.set(-20,35,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-30,right:30,top:35,bottom:-35});sun.shadow.bias=-.001;scene.add(sun);
const mats={};function mat(c){return mats[c]??=new T.MeshStandardMaterial({color:c,roughness:.78})}function mesh(geo,c,x=0,y=0,z=0,parent=scene){let m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}function box(w,h,d,c,x,y,z,p){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p)}function ball(r,c,x,y,z,p,s=[1,1,1]){let m=mesh(new T.SphereGeometry(r,16,12),c,x,y,z,p);m.scale.set(...s);return m}function cyl(rt,rb,h,c,x,y,z,p,n=12){return mesh(new T.CylinderGeometry(rt,rb,h,n),c,x,y,z,p)}
box(350,.3,350,0x879c66,0,-.28,-70);
// A continuous ribbon is rebuilt in the rider's local frame. Width follows
// the road normal, so markings, props and collision lanes share one geometry.
const roadStrips=[];
function ribbon(left,right,color,y){
 const count=111,geometry=new T.BufferGeometry(),positions=new Float32Array(count*6),indices=roadIndices(count);
 geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
 geometry.setIndex(indices);const normals=new Float32Array(count*6);for(let i=1;i<normals.length;i+=3)normals[i]=1;
 geometry.setAttribute('normal',new T.BufferAttribute(normals,3));
 const obj=mesh(geometry,color);obj.castShadow=false;obj.frustumCulled=false;
 roadStrips.push({geometry,positions,left,right,y,count});
}
ribbon(-4.5,4.5,0x777962,.01);ribbon(-5,-4.5,0xd4b895,.03);ribbon(4.5,5,0xd4b895,.03);
function updateRoad(){for(const strip of roadStrips){for(let i=0;i<strip.count;i++){
 const d=g.distance-25+i*2;
 for(let side=0;side<2;side++){const p=roadPoint(d,side?strip.right:strip.left,g.distance),at=i*6+side*3;
 strip.positions[at]=p.x;strip.positions[at+1]=strip.y;strip.positions[at+2]=p.z;}
 }strip.geometry.attributes.position.needsUpdate=true;}}
let movers=[];for(let z=-180;z<18;z+=7)for(let x of [-1.5,1.5]){
 let m=box(.08,.015,3,0xe8dcc7,x,.055,z);movers.push({obj:m,base:z,offset:x,wrap:196});}
function tree(x,z,scale=1){let tr=new T.Group();tr.position.set(x,0,z);tr.scale.setScalar(scale);scene.add(tr);cyl(.16,.25,2.1,0x896b4b,0,1,0,tr);ball(1.2,0x60794b,0,2.9,0,tr,[1,1.4,1]);ball(.9,0x809761,.7,2.5,.1,tr);movers.push({obj:tr,base:z,offset:x,wrap:200})}
for(let i=0;i<64;i++){let side=i%2?1:-1;tree(side*(7+(i*7.13)%19),-i*3, .8+(i%4)*.25)}
for(let i=0;i<36;i++){let x=(i%2?1:-1)*(6+i%7),z=-i*5.3;let rock=ball(.5,0xb0ad91,x,.25,z,scene,[1.3,.7,1]);movers.push({obj:rock,base:z,offset:x,wrap:200});}
for(let i=0;i<16;i++){let cloud=new T.Group();cloud.position.set((i%2?1:-1)*(20+i*3),16+(i%3)*2,-i*15);scene.add(cloud);for(let k=0;k<3;k++)ball(2,0xe4e7d4,k*2,0,0,cloud,[1.7,.7,1]);}
for(let i=0;i<10;i++){let mountain=cyl(0,16+ i%3*5,18+i%4*5,0x7e9988,(i-5)*25,7,-135,scene,5);mountain.castShadow=false;}
const bike=new T.Group();scene.add(bike);const wheels=[];for(let z of [-1.1,1.05]){let w=new T.Group();w.position.set(0,.48,z);bike.add(w);let tire=mesh(new T.TorusGeometry(.45,.14,10,24),0x354238,0,0,0,w);tire.rotation.y=Math.PI/2;let hub=cyl(.22,.22,.17,0xd4b895,0,0,0,w);hub.rotation.z=Math.PI/2;for(let i=0;i<6;i++){let spoke=box(.06,.68,.06,0xb0b9ab,0,0,0,w);spoke.rotation.x=i*Math.PI/3;}wheels.push(w)}
const bikePaint=[box(.62,.5,1.55,0x82b8a0,0,.95,0,bike),ball(.46,0x97cbb0,0,1.1,-.6,bike,[.9,.8,1.3])];box(.55,.15,.72,0x775841,0,1.28,.45,bike);for(let x of [-.3,.3]){let fork=box(.08,.9,.08,0xc9c7ac,x,.92,-1,bike);fork.rotation.x=-.25}box(1.1,.08,.09,0x566052,0,1.5,-.9,bike);ball(.24,0xffe7a4,0,1.25,-1.19,bike,[1,1,.4]);box(.28,.16,.1,0xc66b3d,0,.93,1.5,bike);
let riderParts,selected=CHARACTERS[0],laneOffset=0;
function selectCharacter(id){
 if(!g.selectCharacter(id))return;
 selected=CHARACTERS.find(c=>c.id===id);
 if(riderParts)removeModel(riderParts.rider);
 riderParts=buildRider(selected,T,{ball,box,cyl});bike.add(riderParts.rider);
 for(const paint of bikePaint)paint.material=mat(selected.bike);
 $('riderName').textContent=selected.name;
 document.querySelectorAll('[data-character]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.character===id)));
 try{localStorage.setItem('dog-moto-character',id)}catch{}
}
$('characters').innerHTML=CHARACTERS.map(c=>`<button data-character="${c.id}" aria-pressed="false">${portrait(c)}<span>${c.name}</span><small>${c.detail}</small></button>`).join('');
document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>selectCharacter(b.dataset.character));
let savedCharacter='dog';try{savedCharacter=localStorage.getItem('dog-moto-character')||'dog'}catch{}
selectCharacter(CHARACTERS.some(c=>c.id===savedCharacter)?savedCharacter:'dog');
let objects=[];function bone(){let o=new T.Group();let b=cyl(.1,.1,.75,0xffe6aa,0,0,0,o);b.rotation.z=Math.PI/2;for(let x of [-.37,.37])for(let y of [-.1,.1])ball(.15,0xffe6aa,x,y,0,o);return o}
function prop(type,lane,distance){let o=new T.Group();if(type==='bone')o.add(bone());else if(type==='cone'){box(.8,.08,.8,0xe8dcc7,0,.04,0,o);cyl(0,.35,.9,0xc66b3d,0,.49,0,o);cyl(.12,.2,.22,0xe8dcc7,0,.53,0,o)}else{let ramp=box(1.8,.3,2.8,0xb08b6e,0,.23,0,o);ramp.rotation.x=.2;for(let z of [-.8,0,.8])box(1.75,.04,.08,0xe8dcc7,0,.46-z*.2,z,o)}scene.add(o);objects.push({o,type,lane,distance,done:false});}
function track(){for(let item of objects)removeModel(item.o);objects=[];for(let d=35,i=0;d<1470;d+=22,i++){let lane=(i*7%3)-1;prop('bone',lane,d);prop('bone',lane,d+5);prop('bone',lane,d+10);if(i%3===1)prop('cone',(lane+2)%3-1,d+14);if(i%7===4)prop('ramp',lane,d-6);}}
let finish=new T.Group();scene.add(finish);for(let x of [-4,4])cyl(.14,.14,5,0xb08b6e,x,2.5,0,finish);box(8.2,1,.2,0xe8dcc7,0,4.6,0,finish);for(let i=0;i<16;i++)for(let j=0;j<2;j++)if((i+j)%2===0)box(.5,.5,.03,0x606c38,-3.75+i*.5,4.35+j*.5,.12,finish);
let best=0;try{best=Number(localStorage.getItem('dog-moto-best'))||0}catch{}$('best').textContent=best;
let sound=false,audio,toastTime=0;function beep(freq=600){if(!sound)return;audio??=new AudioContext();audio.resume();let osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.frequency.value=freq;gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);osc.start();osc.stop(audio.currentTime+.15)}function toast(s){$('toast').textContent=s;toastTime=1.5;$('toast').style.opacity=1}
function start(){g.start();track();$('overlay').style.display='none';$('pause').textContent='暂停';laneOffset=0;bike.position.set(0,0,0);beep(400)}function pause(){g.pause();$('pause').textContent=g.status==='paused'?'继续':'暂停';if(g.status==='paused'){show('休息一下，等你回来。','点击继续，回到刚才的位置。','继续冒险')}else if(g.status==='playing')$('overlay').style.display='none'}
function show(title,desc,button){$('title').textContent=title;$('description').textContent=desc;$('start').textContent=button;$('overlay').style.display='flex'}
$('start').onclick=()=>g.status==='paused'?pause():start();$('pause').onclick=pause;$('changeRider').onclick=()=>{if(g.status==='playing')pause();else if(g.status==='paused')$('overlay').style.display='flex';else $('overlay').style.display='flex';};$('sound').onclick=()=>{sound=!sound;$('sound').textContent='声音：'+(sound?'开':'关');beep()};function action(a){if(a==='left')g.move(-1);if(a==='right')g.move(1);if(a==='jump'){g.jump();beep(300)}}document.querySelectorAll('[data-action]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();action(b.dataset.action)});
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='ArrowLeft'||e.code==='KeyA')action('left');if(e.code==='ArrowRight'||e.code==='KeyD')action('right');if(e.code==='Space'||e.code==='ArrowUp')action('jump');if(e.code==='KeyP'||e.code==='Escape')pause();if(e.code==='Enter'&&['ready','won','lost'].includes(g.status))start()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&g.status==='playing')pause()});addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
track();let last=performance.now();function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;const old=g.status;g.step(dt);let active=g.status==='playing';let t=now/1000;
if(active){
 laneOffset=T.MathUtils.damp(laneOffset,g.lane*3,10,dt);
 const p=roadPoint(g.distance,laneOffset,g.distance);bike.position.set(p.x,g.y+Math.sin(t*18)*.018,p.z);
 bike.rotation.y=p.yaw;
 bike.rotation.z=T.MathUtils.damp(bike.rotation.z,(laneOffset-g.lane*3)*.13+roadBank(g.distance,g.speed),8,dt);
 bike.rotation.x=g.y>0?-.12:0;for(let w of wheels)w.rotation.x-=g.speed*dt*2;
 riderParts.tail.rotation.y=Math.sin(t*10)*.3;for(let e of riderParts.ears)e.rotation.z=Math.sin(t*12)*.09;
 riderParts.scarfEnd.rotation.y=Math.sin(t*15)*.16;
}else if(g.status==='ready')bike.rotation.y=roadPoint(0).yaw;
bike.visible=!(active&&g.invincible>0&&Math.floor(t*12)%2);
updateRoad();
for(let m of movers){const z=((m.base+g.distance+180)%m.wrap)-180,p=roadPoint(g.distance-z,m.offset,g.distance);
 m.obj.position.x=p.x;m.obj.position.z=p.z;m.obj.rotation.y=p.yaw;}
for(let item of objects){const z=g.distance-item.distance;const p=roadPoint(item.distance,item.lane*3,g.distance);item.o.position.set(p.x,item.type==='bone'?1.1+Math.sin(t*3+item.distance)*.15:0,p.z);item.o.rotation.y=p.yaw;item.o.visible=!item.done&&z>-170&&z<12;if(item.type==='bone')item.o.rotation.y=t*2;
if(active&&!item.done&&Math.abs(z)<1.05&&Math.abs(laneOffset-item.lane*3)<.95){if(item.type==='bone'&&g.y>1.6)continue;item.done=true;item.o.visible=false;if(g.interact(item.type)){beep(item.type==='bone'?800:180);if(item.type==='cone')toast('碰到路障啦！换道或跳跃避开');if(item.type==='ramp')toast('飞跃木坡！')}}}
const fp=roadPoint(1500,0,g.distance);finish.position.set(fp.x,0,fp.z);finish.rotation.y=fp.yaw;
let preview=g.status==='ready'||g.status==='paused';
const heading=roadPoint(g.distance,0,g.distance).yaw;
const behind=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),heading);
let target=preview?new T.Vector3(bike.position.x+6,3.5,bike.position.z-7):new T.Vector3(bike.position.x*.45+behind.x*9,4.6,behind.z*9);
camera.position.lerp(target,1-Math.exp(-dt*3));
const ahead=roadPoint(g.distance+18,laneOffset*.35,g.distance);
camera.lookAt(preview?bike.position.x+2.5:ahead.x,preview?1.5:1.2,preview?bike.position.z+1.5:ahead.z);
const turn=roadTurn(g.distance+35);
$('curve').textContent=Math.abs(turn)<.001?'前方平缓':turn>0?'前方右弯':'前方左弯';
$('score').textContent=g.score;$('hearts').textContent=g.hearts+' / 3';$('speed').textContent=active?Math.round(g.speed*3.6):0;$('distance').textContent=Math.ceil(1500-g.distance);$('progress').style.width=g.distance/15+'%';if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').style.opacity=0}
if(old==='playing'&&['won','lost'].includes(g.status)){best=Math.max(best,g.score);try{localStorage.setItem('dog-moto-best',best)}catch{}$('best').textContent=best;show(g.status==='won'?'山顶营地，到达！':'再试一次，你能行。',`本次收集 ${g.score/10} 根骨头，获得 ${g.score} 分。`+(g.status==='lost'?'记得换道或跳过路障。':selected.name+'完成了这趟森林冒险。'),'再玩一次');}
renderer.render(scene,camera)}requestAnimationFrame(frame);
