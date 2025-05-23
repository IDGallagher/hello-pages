import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

// NEW: Simulation and Viewport state
let simGridWidth = 256; // Default, will be overridden by config
let simGridHeight = 256; // Default, will be overridden by config
let zoomLevel = 1.0;    // Higher = more zoomed in (smaller world area visible)
const MIN_ZOOM = 0.1;   // Min zoom out level
const MAX_ZOOM = 100.0;  // Max zoom in level (adjust as needed)
let cameraViewOffset = new THREE.Vector2(0, 0); // Pan offset (in world units)
let isDragging = false;
let lastMousePosition = new THREE.Vector2();

// OLD: currentSimWidth, currentSimHeight (no longer represent GPGPU dimensions directly)
// We still need canvas dimensions for aspect ratio and mouse input scaling.
let canvasWidth = 0;
let canvasHeight = 0;

let renderer, scene, camera, plane;
let gpu; // GPUComputationRenderer instance
let mainSimulationVariable; // Stores the primary GPGPU variable for computation

let activeComputeShaderPath;
let activeDisplayShaderPath;
let activeInitialDataFunction;
let canvasElement;

let displayMaterial;

let activeComputeFragmentShaderString = ''; // NEW: To store the fetched compute shader string

// NEW: Speed control variables
let simulationStepsPerFrame = 1; // How many compute() calls if running fast
let framesPerSimulationStep = 1; // How many animation frames per single compute() call (for slow speeds)
let currentFrameCountForSlowSpeed = 0; // Counter for slow speeds
let isPaused = false; // Flag for paused state

// Simple pass-through Vertex Shader for the display plane
const defaultVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// NEW: Function to update camera projection based on zoom and pan
function updateCameraProjection() {
  if (!camera || !canvasElement || canvasWidth === 0 || canvasHeight === 0) return;

  const aspectRatio = canvasWidth / canvasHeight;

  // The camera views a portion of the world. 
  // zoomLevel = 1 means view a certain base area.
  // Higher zoomLevel means view a smaller area (zoomed in).
  // Lower zoomLevel means view a larger area (zoomed out).
  const viewWidth = simGridWidth / zoomLevel;
  const viewHeight = viewWidth / aspectRatio;

camera.left = -viewWidth / 2 + cameraViewOffset.x;
  camera.right = viewWidth / 2 + cameraViewOffset.x;
  camera.top = viewHeight / 2 - cameraViewOffset.y;  // Y is inverted for panning
  camera.bottom = -viewHeight / 2 - cameraViewOffset.y; // Y is inverted for panning

  camera.updateProjectionMatrix();
}

// Core GPGPU computation setup function (internal)
async function setupComputationInternal(_width, _height, forceNewGpu = false) {
  if (!activeComputeShaderPath || !activeInitialDataFunction) {
    console.error("Compute shader or initial data fn not set.");
    return false;
  }
  const computeShaderResponse = await fetch(activeComputeShaderPath);
  if (!computeShaderResponse.ok) {
    console.error(`Failed to fetch compute shader: ${activeComputeShaderPath}, status: ${computeShaderResponse.status}`);
    return false;
  }
  activeComputeFragmentShaderString = await computeShaderResponse.text(); // STORE the shader string

  if (mainSimulationVariable && mainSimulationVariable.material) {
    mainSimulationVariable.material.dispose();
    mainSimulationVariable = null;
  }
  // If GPU exists and dimensions/renderer changed, or if forced, dispose and recreate
  if (forceNewGpu && gpu) {
      // Need to properly dispose of old GCR and its textures if possible.
      // GCR doesn't have a top-level dispose. Variables are disposed when new ones are added
      // or materials are disposed. Ping-pong textures might need manual disposal if GCR doesn't handle it on re-init.
      // For now, relying on new GCR instance and variable re-add for cleanup.
      gpu = null; // Force recreation
  }

  if (!gpu || gpu.sizeX !== _width || gpu.sizeY !== _height) {
      gpu = new GPUComputationRenderer(_width, _height, renderer);
  }
  
  const initialTexture = activeInitialDataFunction(_width, _height, gpu);
  initialTexture.minFilter = THREE.NearestFilter;
  initialTexture.magFilter = THREE.NearestFilter;
  initialTexture.needsUpdate = true; 

  mainSimulationVariable = gpu.addVariable('textureState', activeComputeFragmentShaderString, initialTexture);
  mainSimulationVariable.minFilter = THREE.NearestFilter;
  mainSimulationVariable.magFilter = THREE.NearestFilter;
  gpu.setVariableDependencies(mainSimulationVariable, [mainSimulationVariable]);

  if (!mainSimulationVariable.material.uniforms.resolution) {
    mainSimulationVariable.material.uniforms.resolution = { value: new THREE.Vector2(_width, _height) };
  } else {
    mainSimulationVariable.material.uniforms.resolution.value.set(_width, _height);
  }
  const error = gpu.init();
  if (error !== null) {
    console.error('GCR Error: ' + error);
    return false;
  }
  return true;
}

// New: Setup the display material
async function setupDisplayMaterialInternal() {
    if (!activeDisplayShaderPath) {
        console.error("Display shader path is not set.");
        if (plane) plane.material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Error material
        return false;
    }

    const displayShaderResponse = await fetch(activeDisplayShaderPath);
    if (!displayShaderResponse.ok) {
        console.error(`Failed to fetch display shader: ${activeDisplayShaderPath}, status: ${displayShaderResponse.status}`);
        if (plane) plane.material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Error material
        return false;
    }
    const displayFragmentShader = await displayShaderResponse.text();

    if (displayMaterial) {
        displayMaterial.dispose();
    }

    displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            // This will be updated each frame with the GPGPU output
            u_simulationTexture: { value: null }, 
        },
        vertexShader: defaultVertexShader,
        fragmentShader: displayFragmentShader,
    });

    if (plane) {
        plane.material = displayMaterial;
    }
    return true;
}


// Resize handler (internal)
async function onWindowResizeInternal() {
  if (!renderer || !camera || !canvasElement) return;

  canvasWidth = canvasElement.clientWidth;
  canvasHeight = canvasElement.clientHeight;
  renderer.setSize(canvasWidth, canvasHeight);

  // Update camera for new aspect ratio and current zoom/pan state
  updateCameraProjection();
  
  // Note: Simulation grid and plane size do NOT change on window resize anymore.
}

// Animation loop (internal)
function animateInternal() {
  requestAnimationFrame(animateInternal);

  if (!isPaused && gpu && mainSimulationVariable && displayMaterial && displayMaterial.uniforms.u_simulationTexture) {
    if (framesPerSimulationStep > 1) {
      currentFrameCountForSlowSpeed++;
      if (currentFrameCountForSlowSpeed >= framesPerSimulationStep) {
        gpu.compute(); // Run one simulation step
        currentFrameCountForSlowSpeed = 0;
      }
    } else { // Normal or fast speed (framesPerSimulationStep is 1)
      for (let i = 0; i < simulationStepsPerFrame; i++) {
        gpu.compute();
      }
    }
    displayMaterial.uniforms.u_simulationTexture.value = gpu.getCurrentRenderTarget(mainSimulationVariable).texture;
  }
  
  // Always render the scene
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

export function initSimulationEngine(config) {
  const { 
    canvasId, 
    initialComputeShaderPath, 
    initialDataFunction, 
    initialDisplayShaderPath,
    simulationGridWidth: confSimGridWidth,      // New from config
    simulationGridHeight: confSimGridHeight     // New from config
  } = config;

  if (!canvasId || !initialComputeShaderPath || !initialDataFunction || !initialDisplayShaderPath || !confSimGridWidth || !confSimGridHeight) {
    console.error("initSimulationEngine requires: canvasId, initialComputeShaderPath, initialDataFunction, initialDisplayShaderPath, simulationGridWidth, simulationGridHeight.");
    return;
  }

  simGridWidth = confSimGridWidth;
  simGridHeight = confSimGridHeight;

  canvasElement = document.getElementById(canvasId);
  if (!canvasElement) {
    console.error(`Canvas element with ID '${canvasId}' not found.`);
    return;
  }
  canvasWidth = canvasElement.clientWidth;
  canvasHeight = canvasElement.clientHeight;

  activeComputeShaderPath = initialComputeShaderPath;
  activeDisplayShaderPath = initialDisplayShaderPath;
  activeInitialDataFunction = initialDataFunction;

  renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
  renderer.setSize(canvasWidth, canvasHeight); // Initial size
  scene = new THREE.Scene();
  
  // Camera is orthographic, looking at a portion of the large simulation grid
  camera = new THREE.OrthographicCamera(); // Frustum set by updateCameraProjection
  camera.position.z = 5; // Keep camera at a distance looking towards Z=0
  
  // Plane is now the fixed large simulation size
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(simGridWidth, simGridHeight), 
    new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: false }) // Placeholder, displayMaterial is set later
  );
  scene.add(plane);
  
  // Initial setup sequence
  (async () => {
    await setupDisplayMaterialInternal(); // Setup display material first
    await setupComputationInternal(simGridWidth, simGridHeight); // Then computation
    updateCameraProjection(); // Set initial camera view
    
    // Attach mouse event listeners
    canvasElement.addEventListener('wheel', onMouseWheel, { passive: false });
    canvasElement.addEventListener('mousedown', onMouseDown);
    canvasElement.addEventListener('mousemove', onMouseMove);
    canvasElement.addEventListener('mouseup', onMouseUp);
    canvasElement.addEventListener('mouseleave', onMouseLeave); // Stop dragging if mouse leaves canvas

    window.addEventListener('resize', onWindowResizeInternal, false);
    animateInternal(); 
  })();
}

// --- Mouse Event Handlers ---
function onMouseWheel(event) {
  event.preventDefault(); // Prevent page scrolling
  const zoomFactor = 0.1;
  if (event.deltaY < 0) { // Zoom in
    zoomLevel = Math.min(MAX_ZOOM, zoomLevel * (1 + zoomFactor));
  } else { // Zoom out
    zoomLevel = Math.max(MIN_ZOOM, zoomLevel * (1 - zoomFactor));
  }
  updateCameraProjection();
}

function onMouseDown(event) {
  if (event.button === 0) { // Left mouse button
    isDragging = true;
    lastMousePosition.set(event.clientX, event.clientY);
  }
}

function onMouseMove(event) {
  if (isDragging) {
    const currentMousePosition = new THREE.Vector2(event.clientX, event.clientY);
    const delta = currentMousePosition.clone().sub(lastMousePosition);
    lastMousePosition.copy(currentMousePosition);

    // Calculate how many world units correspond to one screen pixel at the current zoom and canvas size.
    // viewWidth is simGridWidth / zoomLevel
    // viewHeight is (simGridWidth / zoomLevel) / (canvasWidth / canvasHeight)
    const screenToWorldScaleX = (simGridWidth / zoomLevel) / canvasWidth;
    // For Y, to maintain consistent feel with X, especially with non-square aspect ratios:
    // Use the same scaling factor derived from width, or calculate independently based on height.
    // Using the X scale for both often feels more natural unless specific independent scaling is desired.
    const screenToWorldScaleY = (simGridWidth / zoomLevel) / canvasWidth; // Using same scale as X for consistent feel.
                                                                      // Alternatively: (simGridHeight / zoomLevel) / canvasHeight if simGrid aspect != canvas aspect
                                                                      // Or more accurately: ((simGridWidth / zoomLevel) / (canvasWidth/canvasHeight) ) / canvasHeight
                                                                      // which simplifies to (simGridWidth / zoomLevel) / canvasWidth. So it's the same.

    cameraViewOffset.x -= delta.x * screenToWorldScaleX;
    cameraViewOffset.y -= delta.y * screenToWorldScaleY; // Corrected based on previous discussion for intuitive dragging

    updateCameraProjection();
  }
}

function onMouseUp(event) {
  if (event.button === 0) {
    isDragging = false;
  }
}

function onMouseLeave() {
  isDragging = false; // Stop dragging if mouse leaves the canvas
}


// --- Functions to change simulation (largely unchanged, but ensure they use fixed grid size) ---
export async function loadNewComputeSimulation(computeShaderPath, initialDataFn) {
    if (!computeShaderPath || !initialDataFn) {
        console.error("loadNewComputeSimulation requires computeShaderPath and initialDataFn.");
        return false;
    }
    activeComputeShaderPath = computeShaderPath;
    activeInitialDataFunction = initialDataFn;
    console.log(`Loading new compute simulation: ${computeShaderPath}`);
    const success = await setupComputationInternal(simGridWidth, simGridHeight, true); // Use fixed grid size
    if (success && gpu && mainSimulationVariable && displayMaterial) {
        displayMaterial.uniforms.u_simulationTexture.value = gpu.getCurrentRenderTarget(mainSimulationVariable).texture;
    } else if (displayMaterial) {
        displayMaterial.uniforms.u_simulationTexture.value = null;
    }
    return success;
}

export async function loadNewDisplayShader(displayShaderPath) {
    if (!displayShaderPath) {
        console.error("loadNewDisplayShader requires displayShaderPath.");
        return false;
    }
    activeDisplayShaderPath = displayShaderPath;
    console.log(`Loading new display shader: ${displayShaderPath}`);
    const result = await setupDisplayMaterialInternal();
    updateCameraProjection(); // Re-evaluate camera if display changes how things look
    return result;
}

// --- NEW Exposed Control Functions ---
export async function resetSimulation() {
  console.log("Resetting simulation...");
  if (!activeComputeShaderPath || !activeInitialDataFunction || !gpu) { // Check for gpu too
    console.error("Cannot reset: Core components not available.");
    return;
  }

  // Force a full re-setup of the computation pipeline.
  // This will use the existing simGridWidth/Height and active shader path,
  // but will create a new initialTexture via activeInitialDataFunction.
  // The `forceNewGpu = true` in setupComputationInternal handles GCR recreation.

  // Calling setupComputationInternal with forceNewGpu=true (last argument)
  // should handle recreating the GPUComputationRenderer and its variables cleanly.
  const success = await setupComputationInternal(simGridWidth, simGridHeight, true); 

  if (success) {
    console.log("Simulation reset successfully.");
    // Ensure the display material is updated with the new texture from the reset simulation
    if (displayMaterial && gpu && mainSimulationVariable) {
        displayMaterial.uniforms.u_simulationTexture.value = gpu.getCurrentRenderTarget(mainSimulationVariable).texture;
    }
  } else {
    console.error("Failed to reset simulation.");
  }
}

export async function setSimulationGridSize(newSize) {
  if (isNaN(newSize) || newSize < 16) { 
    console.error(`Invalid simulation size: ${newSize}. Must be 16 or greater.`);
    return;
  }
  console.log(`Setting simulation grid size to: ${newSize}x${newSize}`);
  simGridWidth = newSize;
  simGridHeight = newSize;

  // Update plane geometry
  if (plane && plane.geometry) {
    plane.geometry.dispose();
  }
  plane.geometry = new THREE.PlaneGeometry(simGridWidth, simGridHeight);

  // Re-initialize computation with new size (this will create a new GpuComputationRenderer if size changed)
  // Pass true for forceNewGpu to ensure GCR is recreated with new dimensions.
  const computeSuccess = await setupComputationInternal(simGridWidth, simGridHeight, true);
  
  if (computeSuccess) {
    console.log("Simulation grid resized and reinitialized.");
  } else {
    console.error("Failed to reinitialize simulation after size change.");
    // Potentially revert size or handle error
  }
  updateCameraProjection(); // Update camera to new world scale
}

export function setSimulationSpeed(sliderValue) {
  // sliderValue: 0=Paused, 1-9=Slower, 10=1.0x, 11-20=Faster
  console.log(`Slider value received for speed: ${sliderValue}`);
  if (sliderValue === 0) { // Paused
    isPaused = true;
    simulationStepsPerFrame = 0; 
    framesPerSimulationStep = Infinity; // Effectively paused
    console.log("Simulation Paused.");
  } else if (sliderValue < 10) { // Slower than 1.0x
    isPaused = false;
    // Map sliderValue (1-9) to framesPerSimulationStep with more gradation
    // Slider 9 -> 10 - 9 = 1
    // Slider 1 -> 10 - 1 = 9
    const slowLevel = 10 - sliderValue; // Ranges from 1 (fastest slow) to 9 (slowest slow)
    switch (slowLevel) {
      case 1: framesPerSimulationStep = 2; break;  // Slider 9
      case 2: framesPerSimulationStep = 3; break;  // Slider 8
      case 3: framesPerSimulationStep = 4; break;  // Slider 7
      case 4: framesPerSimulationStep = 6; break;  // Slider 6
      case 5: framesPerSimulationStep = 8; break;  // Slider 5
      case 6: framesPerSimulationStep = 12; break; // Slider 4
      case 7: framesPerSimulationStep = 16; break; // Slider 3
      case 8: framesPerSimulationStep = 24; break; // Slider 2
      case 9: framesPerSimulationStep = 30; break; // Slider 1
      default: framesPerSimulationStep = 1; // Should not happen
    }
    simulationStepsPerFrame = 1; // When it runs, it runs one step
    currentFrameCountForSlowSpeed = 0; // Reset counter
    console.log(`Simulation speed: 1 step per ${framesPerSimulationStep} frames.`);
  } else if (sliderValue === 10) { // 1.0x speed
    isPaused = false;
    framesPerSimulationStep = 1;
    simulationStepsPerFrame = 1;
    console.log("Simulation speed: 1.0x (1 step per frame).");
  } else { // Faster than 1.0x (sliderValue > 10)
    isPaused = false;
    framesPerSimulationStep = 1;
    simulationStepsPerFrame = sliderValue - 9; // e.g., sliderValue=11 -> 2 steps/frame; sliderValue=20 -> 11 steps/frame
    console.log(`Simulation speed: ${simulationStepsPerFrame} steps per frame.`);
  }
} 