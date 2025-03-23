import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

let scene, camera, renderer;
let particles, particleSystem;
let progress = 0;
const particleCount = 1000;
const radius = 2;
let time = 0;

function showPortfolioContent() {
    const portfolioContent = document.querySelector('.portfolio-content');
    if (portfolioContent) {
        portfolioContent.style.opacity = '1';
        document.querySelector('section.home').classList.add('active');
    }
    
    // Clean up
    renderer.dispose();
    document.body.removeChild(renderer.domElement);
}

function addStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .portfolio-content {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            color: white;
            overflow-y: auto;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        }
    `;
    document.head.appendChild(styleSheet);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    document.body.appendChild(renderer.domElement);

    createParticles();
    animate();
    simulateLoading();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radiusVariation = radius + (Math.random() - 0.5) * 0.5;
        
        positions[i * 3] = Math.cos(angle) * radiusVariation;
        positions[i * 3 + 1] = Math.sin(angle) * radiusVariation;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

        const hue = (i / particleCount) * 0.1 + 0.6;
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function updateParticles() {
    const positions = particleSystem.geometry.attributes.position.array;
    const sizes = particleSystem.geometry.attributes.size.array;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        
        const angle = Math.atan2(y, x);
        const radius = Math.sqrt(x * x + y * y);
        
        const newRadius = radius + Math.sin(angle * 8 + time) * 0.02;
        
        positions[i3] = Math.cos(angle + time * 0.2) * newRadius;
        positions[i3 + 1] = Math.sin(angle + time * 0.2) * newRadius;
        
        sizes[i] = (Math.sin(time * 2 + i) * 0.5 + 1.5) * 0.05;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    updateParticles();
    particleSystem.rotation.z = time * 0.1;
    
    renderer.render(scene, camera);
}

function simulateLoading() {
    const progressText = document.getElementById('progress-text');
    const interval = setInterval(() => {
        progress += 1;
        progressText.textContent = `Loading ${progress}%`;
        
        particleSystem.material.opacity = 0.3 + (progress / 100) * 0.7;
        
        if (progress >= 100) {
            clearInterval(interval);
            progressText.textContent = 'Welcome';
            setTimeout(completeLoading, 500);
        }
    }, 30);
}

function completeLoading() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.classList.add('fade-out');
    
    const fadeOutAnimation = setInterval(() => {
        particleSystem.scale.x *= 0.95;
        particleSystem.scale.y *= 0.95;
        particleSystem.material.opacity *= 0.95;
        
        if (particleSystem.scale.x <= 0.01) {
            clearInterval(fadeOutAnimation);
            scene.remove(particleSystem);
            addStyles();
            showPortfolioContent();
        }
    }, 20);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

