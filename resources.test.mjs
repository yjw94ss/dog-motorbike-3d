import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './three.module.js';
import * as resources from './characters.mjs';
test('替换模型释放独占几何体并保留共享材质',()=>{
 assert.equal(typeof resources.removeModel,'function');
 const scene=new T.Scene(),group=new T.Group(),geometry=new T.BoxGeometry(),material=new T.MeshStandardMaterial();
 let geometryReleased=false,materialReleased=false;
 geometry.addEventListener('dispose',()=>geometryReleased=true);material.addEventListener('dispose',()=>materialReleased=true);
 group.add(new T.Mesh(geometry,material));scene.add(group);resources.removeModel(group);
 assert.equal(group.parent,null);assert.equal(geometryReleased,true);assert.equal(materialReleased,false);
});
