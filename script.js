import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

let withinMesh, glowMesh;

// Particle Background
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Glow Effect Shader
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xff0000) },
        opacity: { value: 0.3 }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            gl_FragColor = vec4(color, intensity * opacity);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
});

// Load font and create texts
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const freedomMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF });
    const withinMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    
    // FREEDOM Text
    const freedomGeometry = new TextGeometry('FREEDOM', {
        font: font,
        size: 0.8,
        height: 0.3,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 5
    });

    const freedomMesh = new THREE.Mesh(freedomGeometry, freedomMaterial);
    freedomGeometry.computeBoundingBox();
    freedomGeometry.center();
    freedomMesh.position.set(0, 0, 0);
    scene.add(freedomMesh);

    // WITHIN Text
    const withinGeometry = new TextGeometry('WITHIN', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelSegments: 5
    });

    withinMesh = new THREE.Mesh(withinGeometry, withinMaterial);
    withinGeometry.computeBoundingBox();
    withinGeometry.center();
    scene.add(withinMesh);

    // Glow Effect for WITHIN
    glowMesh = new THREE.Mesh(withinGeometry, glowMaterial);
    glowMesh.scale.multiplyScalar(1.1);
    scene.add(glowMesh);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

camera.position.z = 6;

function animate() {
    requestAnimationFrame(animate);

    if (withinMesh && glowMesh) {
        const time = Date.now() * 0.001;
        const radius = 3.5;

        // Circular motion
        withinMesh.position.x = Math.cos(time) * radius;
        withinMesh.position.y = Math.sin(time) * radius;
        withinMesh.position.z = Math.sin(time * 0.5) * radius * 0.5;

        // Update glow position
        glowMesh.position.copy(withinMesh.position);

        // Rotate to face center
        withinMesh.lookAt(0, 0, 0);
        glowMesh.lookAt(0, 0, 0);
    }

    // Rotate particle background
    particlesMesh.rotation.y += 0.001;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

