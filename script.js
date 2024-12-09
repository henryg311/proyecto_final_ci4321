import * as THREE from './three.module.js';

// Configuración básica de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cargar las texturas con mensajes de confirmación
const textureLoader = new THREE.TextureLoader();
let groundTexture, vehicleTexture;

// Cargar textura del suelo
groundTexture = textureLoader.load(
    'assets/textures/ground.png',
    () => console.log("Ground texture loaded successfully"),
    undefined,
    (error) => console.error("Error loading ground texture:", error)
);
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

// Cargar textura del vehículo
vehicleTexture = textureLoader.load(
    'assets/textures/metal.jpg',
    () => console.log("Vehicle texture loaded successfully"),
    undefined,
    (error) => console.error("Error loading vehicle texture:", error)
);

// Añadir luz ambiental y direccional con mayor intensidad
const light = new THREE.AmbientLight(0xffffff, 1); // Luz ambiental
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Luz direccional
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Plano de suelo con textura
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({ map: groundTexture, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Configuración de la cámara
camera.position.z = 20;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

// Estructura básica del vehículo
const vehicleGroup = new THREE.Group();

// Base del vehículo (cubo) con textura
const baseGeometry = new THREE.BoxGeometry(2, 1, 3);
const baseMaterial = new THREE.MeshBasicMaterial({ map: vehicleTexture }); // Material básico para asegurar visibilidad de textura
const base = new THREE.Mesh(baseGeometry, baseMaterial);
vehicleGroup.add(base);

// Torreta del vehículo (media esfera) con textura
const turretGeometry = new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
const turretMaterial = new THREE.MeshBasicMaterial({ map: vehicleTexture }); // Material básico
const turret = new THREE.Mesh(turretGeometry, turretMaterial);
turret.position.y = 0.75;
vehicleGroup.add(turret);

// Añadir el vehículo al escenario
scene.add(vehicleGroup);

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
