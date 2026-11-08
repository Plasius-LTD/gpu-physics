import test from "node:test";
import assert from "node:assert/strict";
import {
  collisionLimits, intersectSpheres, intersectSphereAabb, intersectAabbs,
  sweepSphere, sweepSphereAabb, sweepAabb, integrateKinematic,
} from "../src/collision.js";

const box = { min: [-1, -1, -1], max: [1, 1, 1] };
const sphere = (center, radius = 1) => ({ center, radius });
const close = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const vector = (actual, expected) => actual.forEach((value, i) => close(value, expected[i]));

test("sphere contact handles separation, tangency and coincident centres", () => {
  assert.equal(intersectSpheres(sphere([3, 0, 0]), sphere([0, 0, 0])), null);
  const touch = intersectSpheres(sphere([2, 0, 0]), sphere([0, 0, 0]));
  vector(touch.normal, [1, 0, 0]); vector(touch.point, [1, 0, 0]); close(touch.penetration, 0);
  const inside = intersectSpheres(sphere([0, 0, 0]), sphere([0, 0, 0]));
  vector(inside.normal, [1, 0, 0]); close(inside.penetration, 2);
  assert.ok(intersectSpheres(sphere([0, 0, 0], 0), sphere([0, 0, 0], 0)));
});

test("sphere/box contacts include faces, rounded corners and stable interior ties", () => {
  assert.equal(intersectSphereAabb(sphere([2, 2, 2]), box), null);
  const face = intersectSphereAabb(sphere([-2, 0, 0]), box);
  vector(face.normal, [-1, 0, 0]); vector(face.point, [-1, 0, 0]); close(face.penetration, 0);
  const interior = intersectSphereAabb(sphere([0, 0, 0], 0.5), box);
  vector(interior.normal, [-1, 0, 0]); vector(interior.point, [-1, 0, 0]); close(interior.penetration, 1.5);
  const corner = intersectSphereAabb(sphere([1.5, 1.5, 1], 1), box);
  vector(corner.normal, [Math.SQRT1_2, Math.SQRT1_2, 0]); vector(corner.point, [1, 1, 1]);
  const upper = intersectSphereAabb(sphere([0.9, 0, 0], 0), box);
  vector(upper.normal, [1, 0, 0]); close(upper.penetration, 0.1);
});

test("box contacts include touching and choose the minimum separating translation", () => {
  assert.equal(intersectAabbs({min:[2,0,0],max:[3,1,1]}, box), null);
  const touch=intersectAabbs({min:[1,0,0],max:[2,1,1]}, box);
  vector(touch.normal,[1,0,0]); close(touch.penetration,0);
  const nested=intersectAabbs({min:[-.5,-.5,-.5],max:[.5,.5,.5]},box);
  vector(nested.normal,[-1,0,0]); close(nested.penetration,1.5);
});

test("swept spheres catch high speed crossings and report first contact", () => {
  const hit=sweepSphere(sphere([-1000,0,0]),[2000,0,0],sphere([0,0,0]));
  close(hit.time,0.499); vector(hit.position,[-2,0,0]); vector(hit.normal,[-1,0,0]); assert.equal(hit.startsInContact,false);
  assert.equal(sweepSphere(sphere([-3,0,0]),[-10,0,0],sphere([0,0,0])),null);
  assert.equal(sweepSphere(sphere([-3,0,0]),[0,0,0],sphere([0,0,0])),null);
  const tangent=sweepSphere(sphere([-3,2,0]),[6,0,0],sphere([0,0,0])); close(tangent.time,.5);
  assert.equal(sweepSphere(sphere([-3,2.1,0]),[6,0,0],sphere([0,0,0])),null);
  const initial=sweepSphere(sphere([0,0,0]),[5,0,0],sphere([0,0,0]));
  close(initial.time,0); assert.equal(initial.startsInContact,true);
});

test("swept sphere/box catches thin walls without inflated-corner false positives", () => {
  const thin={min:[-.01,-2,-2],max:[.01,2,2]};
  const hit=sweepSphereAabb(sphere([-1000,0,0],.5),[2000,0,0],thin);
  close(hit.time,.499745); vector(hit.position,[-.51,0,0]); vector(hit.normal,[-1,0,0]); vector(hit.point,[-.01,0,0]);
  assert.equal(sweepSphereAabb(sphere([-3,1.9,1.9]),[6,0,0],box),null);
  const tangent=sweepSphereAabb(sphere([-3,1.6,1.8]),[6,0,0],box);
  close(tangent.time,1/3); vector(tangent.normal,[0,.6,.8]);
  assert.equal(sweepSphereAabb(sphere([-3,0,0]),[-6,0,0],box),null);
  assert.equal(sweepSphereAabb(sphere([-3,0,0]),[0,0,0],box),null);
  close(sweepSphereAabb(sphere([-3,0,0]),[1,0,0],box).time,1);
  const initial=sweepSphereAabb(sphere([0,0,0]),[2,0,0],box);
  assert.equal(initial.startsInContact,true); close(initial.time,0);
});

test("swept boxes use extent-aware contacts on every axis", () => {
  for(let axis=0;axis<3;axis++) for(const sign of [-1,1]) {
    const min=[-.5,-.5,-.5],max=[.5,.5,.5],delta=[0,0,0],normal=[0,0,0];
    min[axis]+=sign*5; max[axis]+=sign*5; delta[axis]=-sign*10; normal[axis]=sign;
    const hit=sweepAabb({min,max},delta,box); close(hit.time,.35); vector(hit.normal,normal);
    close(hit.position[axis],sign*1.5); close(hit.point[axis],sign);
  }
  assert.equal(sweepAabb({min:[5,5,5],max:[6,6,6]},[0,0,0],box),null);
  assert.equal(sweepAabb(box,[100,0,0],box).startsInContact,true);
});

test("kinematic integration is fixed-step, detached and repeatable", () => {
  const initial={position:[0,0,0],velocity:[2,0,0]};
  const once=integrateKinematic(initial,[0,-10,0],.1);
  vector(once.position,[.2,-.1,0]); vector(once.velocity,[2,-1,0]);
  function replay(){let state=structuredClone(initial);for(let i=0;i<600;i++)state=integrateKinematic(state,[0,-10,0],1/60);return state;}
  assert.deepEqual(replay(),replay()); assert.deepEqual(initial,{position:[0,0,0],velocity:[2,0,0]});
  const stopped=integrateKinematic(initial,[0,0,0],0); assert.deepEqual(stopped,initial); assert.notEqual(stopped.position,initial.position);
});

test("all queries reject nonfinite, oversized or malformed inputs", () => {
  for(const center of [null,[],[0,0],[0,0,0,0],[NaN,0,0],[Infinity,0,0],[1e6+1,0,0],["0",0,0]]) {
    assert.throws(()=>intersectSpheres(sphere(center),sphere([0,0,0])));
  }
  for(const radius of [-1,Infinity,NaN,1e6+1]) assert.throws(()=>intersectSphereAabb(sphere([0,0,0],radius),box));
  for(const value of [null,{}, {min:[2,0,0],max:[1,1,1]}]) assert.throws(()=>intersectAabbs(value,box));
  assert.throws(()=>sweepSphere(null,[0,0,0],sphere([0,0,0])));
  assert.throws(()=>sweepSphereAabb(sphere([0,0,0]),[Infinity,0,0],box));
  assert.throws(()=>sweepSphereAabb(sphere([1e6,0,0]),[1,0,0],box));
  assert.throws(()=>sweepAabb({min:[999999,0,0],max:[1e6,1,1]},[1,0,0],box));
  assert.throws(()=>sweepAabb(box,[0,0,0],{min:[0,0,0],max:[1e6+1,0,0]}));
  for(const dt of [-1,.25001,NaN,Infinity,"0.1"]) assert.throws(()=>integrateKinematic({position:[0,0,0],velocity:[0,0,0]},[0,0,0],dt));
  assert.throws(()=>integrateKinematic({position:[1e6,0,0],velocity:[1,0,0]},[0,0,0],.1));
  assert.throws(()=>integrateKinematic({position:[0,0,0],velocity:[1e5,0,0]},[1,0,0],.1));
  assert.throws(()=>integrateKinematic(null,[0,0,0],.1));
  assert.throws(()=>integrateKinematic({position:[0,0,0],velocity:[0,0,0]},[1e6+1,0,0],.1));
  assert.equal(collisionLimits.maxStepSeconds,.25); assert.ok(Object.isFrozen(collisionLimits));
});

test("queries preserve inputs and give finite repeatable results at world bounds", () => {
  const a=sphere([999998,0,0]),b={min:[999999,-1,-1],max:[1e6,1,1]},delta=[2,0,0];
  const before=structuredClone({a,b,delta});
  const one=sweepSphereAabb(a,delta,b),two=sweepSphereAabb(a,delta,b);
  assert.deepEqual(one,two); assert.deepEqual({a,b,delta},before);
  assert.ok([...one.position,...one.point,...one.normal,one.time,one.penetration].every(Number.isFinite));
});

test("swept sphere/box agrees with independently sampled paths", () => {
  let seed=3485; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
  const distance=(p)=>Math.sqrt(p.reduce((sum,x)=>sum+Math.max(-1-x,0,x-1)**2,0));
  for(let i=0;i<300;i++) {
    const start=Array.from({length:3},()=>random()*10-5),delta=Array.from({length:3},()=>random()*10-5),radius=random();
    const hit=sweepSphereAabb(sphere(start,radius),delta,box);
    const at=t=>start.map((x,k)=>x+delta[k]*t);
    if(hit){assert.ok(distance(at(hit.time))<=radius+1e-7);if(hit.time>1e-5)assert.ok(distance(at(hit.time-1e-5))>=radius-1e-7);}
    for(let step=0;step<=100;step++) if(distance(at(step/100))<=radius) {assert.ok(hit);assert.ok(hit.time<=step/100+1e-8);break;}
  }
});

test("long paths preserve first impact for small radii without quadratic cancellation", () => {
  const small=sphere([-1e6,0,0],.001),delta=[1e6,0,0];
  const round=sweepSphere(small,delta,sphere([0,0,0],0));
  assert.ok(round); close(round.position[0],-.001);
  const wall=sweepSphereAabb(small,delta,{min:[0,-1,-1],max:[1,1,1]});
  assert.ok(wall); close(wall.position[0],-.001);
});
