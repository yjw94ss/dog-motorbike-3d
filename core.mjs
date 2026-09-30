export function createGame(){return {character:'dog',status:'ready',distance:0,score:0,hearts:3,lane:0,y:0,vy:0,invincible:0,speed:18,
selectCharacter(id){if(!['dog','cat','rabbit','panda'].includes(id))return false;this.character=id;return true},
start(){Object.assign(this,{status:'playing',distance:0,score:0,hearts:3,lane:0,y:0,vy:0,invincible:0,speed:18})},
pause(){if(this.status==='playing')this.status='paused';else if(this.status==='paused')this.status='playing'},
move(d){if(this.status==='playing')this.lane=Math.max(-1,Math.min(1,this.lane+d))},
jump(){if(this.status==='playing'&&this.y===0)this.vy=9},
step(dt){if(this.status!=='playing')return;this.invincible=Math.max(0,this.invincible-dt);this.speed=18+Math.min(10,this.distance/150);this.distance=Math.min(1500,this.distance+this.speed*dt);this.y=Math.max(0,this.y+this.vy*dt-9*dt*dt);this.vy-=18*dt;if(!this.y)this.vy=0;if(this.distance>=1500)this.status='won'},
interact(type){if(this.status!=='playing')return false;if(type==='bone'){this.score+=10;return true}if(type==='ramp'){this.jump();return true}if(this.y>.7||this.invincible>0)return false;this.hearts--;this.invincible=1.5;if(!this.hearts)this.status='lost';return true}
}}

// Local road frame: distance runs forward, lane offsets follow the road normal.
function center(s){return 18*Math.sin(s/65)+9*Math.sin(s/120)}
function slope(s){return 18/65*Math.cos(s/65)+9/120*Math.cos(s/120)}
export function roadPoint(distance,offset=0,origin=0){
 const k=slope(distance),n=Math.sqrt(1+k*k);
 return {x:center(distance)-center(origin)+offset/n,z:origin-distance+offset*k/n,yaw:-Math.atan(k)};
}
export function roadTurn(s){return (-18/65**2*Math.sin(s/65)-9/120**2*Math.sin(s/120))/(1+slope(s)**2)}
export function roadIndices(count){const indices=[];for(let i=0;i<count-1;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}return indices}
export function roadBank(distance,speed){return Math.max(-.3,Math.min(.3,-roadTurn(distance)*speed*4))||0}
