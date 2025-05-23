import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export async function initSpiralPoints () {

  /* ---------- DOM ---------- */
  const canvas      = document.getElementById('spiral-canvas');
  const sizeSlider  = document.getElementById('point-size');
  const speedSlider = document.getElementById('speed-slider');
  const prevBtn     = document.getElementById('prev-eq');
  const nextBtn     = document.getElementById('next-eq');
  const eqLabel     = document.getElementById('eq-label');

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(window.devicePixelRatio);

  /* ---------- scene & camera ---------- */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate       = false;
  controls.screenSpacePanning = true;
  controls.enableDamping      = true;
  controls.dampingFactor      = 0.05;
  controls.minDistance        = 1.0;
  controls.maxDistance        = 20.0;

  /* ---------- equations metadata ---------- */
  const EQUATIONS = [
    { vert:'./spiral-vert.glsl',  count:30000 },
    { vert:'./spiral2-vert.glsl', count:40000 },
    { vert:'./spiral3-vert.glsl', count:40000 },
    { vert:'./spiral4-vert.glsl', count:40000 },
    { vert:'./spiral5-vert.glsl', count:40000 }
  ];

  /* ---------- load fragment shader once ---------- */
  const fragSrc = await (await fetch('./spiral-frag.glsl')).text();

  /* ---------- build every point-cloud ---------- */
  const clouds = await Promise.all(EQUATIONS.map(async (eq) => {
    const vertSrc = await (await fetch(eq.vert)).text();

    /* geometry */
    const ids = new Float32Array(eq.count);
    for (let i=0;i<eq.count;i++) ids[i]=i;

    const geo = new THREE.InstancedBufferGeometry();
    geo.instanceCount = eq.count;
    geo.setAttribute('instanceId',new THREE.InstancedBufferAttribute(ids,1));
    geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3));

    /* material */
    const mat = new THREE.ShaderMaterial({
      uniforms:{
        u_time:{ value:0 },
        u_pointSize:{ value:parseFloat(sizeSlider.value) },
        u_speed: { value:parseFloat(speedSlider.value) }
      },
      vertexShader  : vertSrc,
      fragmentShader: fragSrc,
      transparent   : true
    });

    const pts = new THREE.Points(geo, mat);
    pts.visible = false;
    scene.add(pts);
    return { points:pts, material:mat };
  }));

  /* ---------- helpers to switch clouds ---------- */
  let current = 0;
  clouds[current].points.visible = true;

  function refreshButtons(){
    eqLabel.textContent = `${current+1} / ${clouds.length}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === clouds.length-1;
  }
  refreshButtons();

  prevBtn.addEventListener('click', ()=>{
    clouds[current].points.visible = false;
    current = Math.max(0, current-1);
    clouds[current].points.visible = true;
    refreshButtons();
  });
  nextBtn.addEventListener('click', ()=>{
    clouds[current].points.visible = false;
    current = Math.min(clouds.length-1, current+1);
    clouds[current].points.visible = true;
    refreshButtons();
  });

  /* ---------- point-size slider ---------- */
  sizeSlider.addEventListener('input', ()=>{
    const v = parseFloat(sizeSlider.value);
    clouds.forEach(c=> c.material.uniforms.u_pointSize.value = v);
  });

  /* ---------- speed slider ---------- */
  speedSlider.addEventListener('input', ()=>{
    const v = parseFloat(speedSlider.value);
    clouds.forEach(c=> c.material.uniforms.u_speed.value = v);
  });

  /* ---------- resize ---------- */
  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width!==w || canvas.height!==h){
      renderer.setSize(w, h, false);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    }
  }

  /* ---------- render loop ---------- */
  function tick(){
    resize();
    controls.update();
    clouds.forEach(c=>{
      if (c.points.visible) c.material.uniforms.u_time.value += (0.03 * c.material.uniforms.u_speed.value);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
} 