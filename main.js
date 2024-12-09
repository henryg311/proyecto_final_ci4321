import * as THREE from './three.module.js';

// Configuración básica de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitar sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
document.body.appendChild(renderer.domElement);

// Ajustar el canvas y la cámara cuando se redimensione la ventana
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Cámara y escena para el overlay (barra de cooldown)
const overlayCamera = new THREE.OrthographicCamera(
    -window.innerWidth / 2, window.innerWidth / 2,
    window.innerHeight / 2, -window.innerHeight / 2,
    0, 10
);
overlayCamera.position.z = 5;
const overlayScene = new THREE.Scene();

// Barra de energía (Cooldown)
const cooldownBarGeometry = new THREE.PlaneGeometry(100, 10);
const cooldownBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cooldownBar = new THREE.Mesh(cooldownBarGeometry, cooldownBarMaterial);
cooldownBar.position.set(-window.innerWidth / 2 + 110, window.innerHeight / 2 - 20, 1);
overlayScene.add(cooldownBar);

// Progreso del cooldown (0 a 1)
let cooldownProgress = 1; 

// Actualización de la barra
function updateCooldownBar(progress) {
    cooldownProgress = Math.min(Math.max(progress, 0), 1);
    cooldownBar.scale.x = cooldownProgress; // Escalar horizontalmente
    cooldownBar.material.color.set(cooldownProgress === 1 ? 0x00ff00 : 0xff0000); // Verde si está lista, roja si no
}
// Crear un canvas 2D para renderizar texto
const obstacleCounterCanvas = document.createElement('canvas');
const obstacleCounterContext = obstacleCounterCanvas.getContext('2d');
obstacleCounterCanvas.width = 512;
obstacleCounterCanvas.height = 128;

// Función para actualizar el texto en el canvas
function updateObstacleCounterText(count) {
    obstacleCounterContext.clearRect(0, 0, obstacleCounterCanvas.width, obstacleCounterCanvas.height);
    obstacleCounterContext.fillStyle = '#ffffff';
    obstacleCounterContext.font = 'bold 60px Arial'; 
    obstacleCounterContext.textAlign = 'center';
    obstacleCounterContext.fillText(
        `Obstacles: ${count}`,
        obstacleCounterCanvas.width / 2,
        obstacleCounterCanvas.height / 2 + 20
    );
    obstacleCounterTexture.needsUpdate = true;
}

// Crear una textura para el contador
const obstacleCounterTexture = new THREE.CanvasTexture(obstacleCounterCanvas);

// Crear un material para el texto
const obstacleCounterMaterial = new THREE.MeshBasicMaterial({ map: obstacleCounterTexture, transparent: true });
const obstacleCounterGeometry = new THREE.PlaneGeometry(4, 1);
const obstacleCounterMesh = new THREE.Mesh(obstacleCounterGeometry, obstacleCounterMaterial);
obstacleCounterMesh.position.set(0, 10, -5);
scene.add(obstacleCounterMesh);

// Cargar texturas
const textureLoader = new THREE.TextureLoader();
let groundTexture, vehicleTexture, turretTexture;

groundTexture = textureLoader.load('assets/textures/ground.png');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

vehicleTexture = textureLoader.load('assets/textures/metal.jpg');
turretTexture = textureLoader.load('assets/textures/metal2.jpg');

// Cargar texturas para los obstáculos y normales
const metal3Texture = textureLoader.load('assets/textures/metal3.jpg');
const metal4Texture = textureLoader.load('assets/textures/metal4.jpg');
const cubeNormalMap = textureLoader.load('assets/textures/cube_normal.jpg');
const sphereNormalMap = textureLoader.load('assets/textures/sphere_normal.jpg');

// Luz ambiental tenue y azulada para la noche
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Azul oscuro, intensidad baja
scene.add(ambientLight);

// Luz direccional con sombras
const directionalLight = new THREE.DirectionalLight(0xffffff, 2); 
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true; // Habilitar proyección de sombras
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Sistema de partículas
function createExplosion(position) {
    const particleCount = 100; // Número de partículas
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];
    const explosionLight = new THREE.PointLight(0xffaa33, 2, 10);

    // Configurar partículas
    for (let i = 0; i < particleCount; i++) {
        positions.push(position.x, position.y, position.z); // Posición inicial
        velocities.push(
            (Math.random() - 0.5) * 2, // Velocidad en X
            Math.random() * 2,         // Velocidad en Y
            (Math.random() - 0.5) * 2  // Velocidad en Z
        );
        colors.push(1, Math.random(), 0); // Colores cálidos (amarillo/rojo)
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    explosionLight.position.copy(position);
    scene.add(explosionLight);
    setTimeout(() => scene.remove(explosionLight), 500); // Apagar la luz después de 0.5 segundos

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15, // Tamaño de las partículas
        vertexColors: true,
        transparent: true,
        opacity: 1,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animar las partículas
    const startTime = Date.now();
    const duration = 1000; // Duración de la explosión (1 segundo)

    function animateParticles() {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime > duration) {
            scene.remove(particles);
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            return;
        }

        const positions = particlesGeometry.attributes.position.array;
        const velocities = particlesGeometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i / 3] * 0.1;     // Movimiento en X
            positions[i + 1] += velocities[i / 3 + 1] * 0.1; // Movimiento en Y
            positions[i + 2] += velocities[i / 3 + 2] * 0.1; // Movimiento en Z
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        particlesMaterial.opacity = 1 - elapsedTime / duration; // Desvanecer
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// Plano de suelo con textura
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({ 
    map: groundTexture,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.1,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Configuración de la cámara
camera.position.z = 25;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

// Estructura básica del vehículo
const vehicleGroup = new THREE.Group();

// Base del vehículo (cilindro)
const baseRadius = 1;
const baseHeight = 1;
const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 32);
const baseMaterial = new THREE.MeshStandardMaterial({ 
    map: vehicleTexture,
    roughness: 0.5,
    metalness: 0.8,
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.rotation.x = Math.PI / 2;
vehicleGroup.add(base);

// Torreta del vehículo (esfera completa) con nueva textura
const turretGeometry = new THREE.SphereGeometry(0.7, 32, 32);
const turretMaterial = new THREE.MeshStandardMaterial({ 
    map: turretTexture,
    roughness: 80,
    metalness: 0.9,
});
const turret = new THREE.Mesh(turretGeometry, turretMaterial);
turret.position.y = 0.75; // Posición inicial de la torreta
vehicleGroup.add(turret);

// Cañón del tanque (añadido como hijo de la torreta)
const cannonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 32);
const cannonMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
cannon.rotation.z = Math.PI / 2;
cannon.position.set(0.75, 0, 0);
turret.add(cannon);

scene.add(vehicleGroup);

// Luz debajo del vehículo
const vehicleLight = new THREE.PointLight(0xffffff, 3, 20); // Luz blanca, intensidad 3, rango 20
vehicleLight.position.set(0, 2, 0); // Justo debajo de la base del vehículo
vehicleLight.castShadow = true; // Permitir que proyecte sombras

// Configuración de sombras
vehicleLight.shadow.mapSize.width = 1024;
vehicleLight.shadow.mapSize.height = 1024;
vehicleLight.shadow.camera.near = 0.1;
vehicleLight.shadow.camera.far = 20;

// Añadir la luz al grupo del vehículo
vehicleGroup.add(vehicleLight);

// Control de encendido/apagado
let lightOn = true;
document.addEventListener('keydown', (event) => {
    if (event.key === 'l') { // Presiona "L" para alternar la luz
        lightOn = !lightOn;
        vehicleLight.intensity = lightOn ? 3 : 0; // Cambiar intensidad entre 3 y 0
    }
});

// Cambiar el color de la luz al presionar una tecla
document.addEventListener('keydown', (event) => {
    if (event.key === 'c') { // Presiona "C" para cambiar el color de la luz
        vehicleLight.color.set(Math.random() * 0xffffff); // Color aleatorio
    }
});


// Variables de velocidad y rotación
const speed = 0.1;
const rotationSpeed = 0.05;
const tiltAngle = 0.1;

// Almacenar proyectiles
const projectiles = [];
const projectileSpeed = 0.5;
const maxProjectileDistance = 50;
const fireRate = 1; // Proyectiles por segundo
let lastShotTime = 0;

// Lista de obstáculos
const obstacles = [];

// Función para crear un obstáculo aleatorio (cubo, cilindro, pirámide) con una de las texturas
function createObstacle(x, y, z) {
    let obstacleGeometry;
    const randomShape = Math.floor(Math.random() * 3); // Elegir entre 0, 1, o 2 para la forma

    // Escoger aleatoriamente la forma del obstáculo
    if (randomShape === 0) {
        obstacleGeometry = new THREE.BoxGeometry(1, 1, 1); // Cubo
    } else if (randomShape === 1) {
        obstacleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); // Cilindro
    } else {
        obstacleGeometry = new THREE.ConeGeometry(0.5, 1, 4); // Pirámide
    }

    // Elegir aleatoriamente la textura para el obstáculo
    const randomTexture = Math.random() < 0.5 ? metal3Texture : metal4Texture;
    const obstacleMaterial = new THREE.MeshStandardMaterial({ 
        map: randomTexture,
        roughness: 0.6,
        metalness: 0.5,
    });

    // Crear el obstáculo
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(x, y, z);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Crear obstáculos con normales (cubo)
function createObstacleWithNormals(x, y, z) {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Material para el cubo que utiliza cubeNormalMap
    const boxMaterial = new THREE.MeshStandardMaterial({
        map: metal3Texture, // Textura base fija para el cubo
        normalMap: cubeNormalMap, 
    });

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(x, y, z);
    scene.add(box);

    // Añadir al arreglo de obstáculos
    obstacles.push(box);
}

// Crear obstáculos con normales (esfera)
function createSphereWithNormals(x, y, z) {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

    // Material para la esfera que utiliza sphereNormalMap
    const sphereMaterial = new THREE.MeshStandardMaterial({
        map: metal4Texture, // Textura base fija para la esfera
        normalMap: sphereNormalMap, 
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);
    scene.add(sphere);

    // Añadir al arreglo de obstáculos
    obstacles.push(sphere);
}


// Crear obstáculos en posiciones aleatorias y dispersas
for (let i = 0; i < 10; i++) {
    const x = Math.random() * 40 - 20; 
    const z = Math.random() * 40 - 20;
    createObstacle(x, 0.5, z);
}
createObstacleWithNormals(10, 0.5, 10); // Obstáculo con normales
createSphereWithNormals(-10, 1, -10); // Esfera con normales

// Rotación dinámica de la luz direccional
function animateDirectionalLight() {
    const time = Date.now() * 0.001;
    directionalLight.position.set(Math.sin(time) * 10, Math.cos(time) * 10, 7.5);
}

// Escuchar eventos de teclado
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === ' ' && Date.now() - lastShotTime >= 1000 / fireRate) {
        shootProjectile();
        lastShotTime = Date.now();
        applyRecoil();
    }
});
document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Función para disparar un proyectil
function shootProjectile() {
    // Crear geometría y material para el proyectil
    const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    // Obtener la posición y dirección actuales del cañón en el espacio global
    const cannonWorldPosition = new THREE.Vector3();
    cannon.getWorldPosition(cannonWorldPosition);

    const cannonDirection = new THREE.Vector3();
    cannon.getWorldDirection(cannonDirection);

    const angleOffset = Math.PI / 2; // Valor para ajustar el ángulo de disparo
    cannonDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset);

    // Colocar el proyectil al final del cañón y darle la dirección ajustada
    projectile.position.copy(cannonWorldPosition).add(cannonDirection.clone().multiplyScalar(0.85));
    projectile.direction = cannonDirection.clone();

    // Almacenar la posición inicial para el cálculo de distancia
    projectile.initialPosition = projectile.position.clone();

    // Añadir el proyectil al escenario y a la lista de proyectiles
    scene.add(projectile);
    projectiles.push(projectile);
}

// Función para aplicar retroceso
function applyRecoil() {
    const recoilDirection = new THREE.Vector3();
    cannon.getWorldDirection(recoilDirection);

    // Invertir la dirección para el retroceso
    recoilDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2); // Alinea el retroceso con el ángulo de disparo
    recoilDirection.multiplyScalar(-0.2); // Ajusta el valor para mayor o menor retroceso

    // Aplicar el retroceso moviendo el vehículo en la dirección opuesta
    vehicleGroup.position.add(recoilDirection);

    // Después de 100 ms, devolver el vehículo a su posición original
    setTimeout(() => {
        vehicleGroup.position.sub(recoilDirection);
    }, 100);
}

// Función para actualizar la posición de los proyectiles y detectar colisiones
function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.position.addScaledVector(projectile.direction, projectileSpeed);

        const distance = projectile.position.distanceTo(projectile.initialPosition);
        if (distance > maxProjectileDistance) {
            scene.remove(projectile);
            projectiles.splice(i, 1);
            continue;
        }

        // Detección de colisiones con obstáculos
        for (let j = obstacles.length - 1; j >= 0; j--) {
            const obstacle = obstacles[j];
            if (projectile.position.distanceTo(obstacle.position) < 0.6) { // Distancia de colisión
                createExplosion(obstacle.position); // Crear la explosión
                scene.remove(obstacle);
                obstacles.splice(j, 1);
                scene.remove(projectile);
                projectiles.splice(i, 1);
                updateObstacleCounterText(obstacles.length);
                break;
            }
        }        
    }
}

// Función de animación y movimiento
function animate() {
    requestAnimationFrame(animate);
    animateDirectionalLight();

    // Actualizar barra de cooldown
    const timeSinceLastShot = Math.min((Date.now() - lastShotTime) / (1000 / fireRate), 1); // Normalizar progreso
    updateCooldownBar(timeSinceLastShot);

    if (keys['w']) {
        vehicleGroup.position.z -= speed;
        base.rotation.x = -tiltAngle;
    } else if (keys['s']) {
        vehicleGroup.position.z += speed;
        base.rotation.x = tiltAngle;
    } else {
        base.rotation.x = 0;
    }

    if (keys['a']) {
        vehicleGroup.position.x -= speed;
        base.rotation.z = tiltAngle;
    } else if (keys['d']) {
        vehicleGroup.position.x += speed;
        base.rotation.z = -tiltAngle;
    } else {
        base.rotation.z = 0;
    }

    if (keys['ArrowLeft']) turret.rotation.y += rotationSpeed;
    if (keys['ArrowRight']) turret.rotation.y -= rotationSpeed;


    updateObstacleCounterText(obstacles.length);

    updateProjectiles();

    // Renderizar escena principal
    renderer.clear(); // Limpiar buffers de color, profundidad y stencil
    renderer.render(scene, camera);

    // Renderizar overlay
    renderer.autoClear = false;
    renderer.render(overlayScene, overlayCamera);
    renderer.autoClear = true;
}

animate();
