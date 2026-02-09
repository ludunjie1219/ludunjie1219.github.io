// ===== Three.js 3D Background =====
class WebGLBackground {
    constructor() {
        this.canvas = document.getElementById('webgl-background');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.init();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 50;

        // Mouse position for particle interaction
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
    }

    createParticles() {
        const particlesCount = 3000;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);

        // Create color palette (purple, pink, cyan)
        const colorPalette = [
            new THREE.Color(0x8b5cf6), // purple
            new THREE.Color(0xec4899), // pink
            new THREE.Color(0x06b6d4)  // cyan
        ];

        for (let i = 0; i < particlesCount * 3; i += 3) {
            // Position
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 50;

            // Color
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Add connection lines
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });

        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse following
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Rotate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x = this.mouse.y * 0.1;
            this.particles.rotation.y += this.mouse.x * 0.01;
        }

        if (this.lines) {
            this.lines.rotation.y += 0.0003;
            this.lines.rotation.x = this.mouse.y * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// ===== Custom Cursor =====
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');

        if (!this.cursor || !this.follower) return;

        this.cursorPos = { x: 0, y: 0 };
        this.followerPos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursorPos.x = e.clientX;
            this.cursorPos.y = e.clientY;
        });

        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .hover-lift');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });

        this.animate();
    }

    animate() {
        // Update cursor position
        this.cursor.style.left = this.cursorPos.x + 'px';
        this.cursor.style.top = this.cursorPos.y + 'px';

        // Smooth follower
        this.followerPos.x += (this.cursorPos.x - this.followerPos.x) * 0.1;
        this.followerPos.y += (this.cursorPos.y - this.followerPos.y) * 0.1;

        this.follower.style.left = this.followerPos.x + 'px';
        this.follower.style.top = this.followerPos.y + 'px';

        requestAnimationFrame(() => this.animate());
    }
}

// ===== GSAP Scroll Animations =====
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        gsap.registerPlugin(ScrollTrigger);

        // Reveal elements on scroll
        const revealElements = document.querySelectorAll('.scroll-reveal');

        revealElements.forEach((element) => {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Parallax effect for sections
        gsap.utils.toArray('section').forEach((section, i) => {
            const bg = section.querySelector('.glass-strong, .glass');

            if (bg) {
                gsap.to(bg, {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    },
                    y: (i, target) => -50,
                    ease: 'none'
                });
            }
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));

                if (target) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: target,
                            offsetY: 80
                        },
                        ease: 'power3.inOut'
                    });
                }
            });
        });

        // Navbar animation on scroll
        const nav = document.querySelector('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.style.backdropFilter = 'blur(20px)';
                nav.style.background = 'rgba(0, 0, 0, 0.8)';
            } else {
                nav.style.backdropFilter = 'blur(10px)';
                nav.style.background = 'rgba(255, 255, 255, 0.08)';
            }

            lastScroll = currentScroll;
        });
    }
}

// ===== Intersection Observer for Animations =====
class IntersectionAnimations {
    constructor() {
        this.init();
    }

    init() {
        const options = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, options);

        // Observe all scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }
}

// ===== Kinetic Typography Animation =====
class KineticText {
    constructor() {
        this.init();
    }

    init() {
        const kineticElements = document.querySelectorAll('.kinetic-text span');

        kineticElements.forEach((span, index) => {
            span.style.animationDelay = `${index * 0.05}s`;
        });

        // Mouse move effect on hero title
        const heroTitle = document.querySelector('.kinetic-text');
        if (heroTitle) {
            heroTitle.addEventListener('mousemove', (e) => {
                const rect = heroTitle.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;

                heroTitle.style.transform = `perspective(1000px) rotateY(${deltaX * 5}deg) rotateX(${-deltaY * 5}deg)`;
            });

            heroTitle.addEventListener('mouseleave', () => {
                heroTitle.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
            });
        }
    }
}

// ===== Gradient Background Animation =====
class GradientBackground {
    constructor() {
        this.init();
    }

    init() {
        // Create gradient orbs
        const numOrbs = 3;
        const colors = ['#8b5cf6', '#ec4899', '#06b6d4'];

        for (let i = 0; i < numOrbs; i++) {
            const orb = document.createElement('div');
            orb.style.position = 'fixed';
            orb.style.width = '500px';
            orb.style.height = '500px';
            orb.style.borderRadius = '50%';
            orb.style.background = `radial-gradient(circle, ${colors[i]} 0%, transparent 70%)`;
            orb.style.opacity = '0.3';
            orb.style.filter = 'blur(80px)';
            orb.style.zIndex = '-2';
            orb.style.pointerEvents = 'none';

            document.body.appendChild(orb);

            // Animate orbs
            gsap.to(orb, {
                x: () => Math.random() * window.innerWidth,
                y: () => Math.random() * window.innerHeight,
                duration: 20 + Math.random() * 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Set initial position
            gsap.set(orb, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            });
        }
    }
}

// ===== Stats Counter Animation =====
class StatsCounter {
    constructor() {
        this.init();
    }

    init() {
        const counters = document.querySelectorAll('.counter');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));

            gsap.to(counter, {
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 80%',
                    once: true
                },
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power1.out'
            });
        });
    }
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new WebGLBackground();
    new CustomCursor();
    new ScrollAnimations();
    new IntersectionAnimations();
    new KineticText();
    new GradientBackground();
    new StatsCounter();

    // Loading animation
    gsap.from('body', {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });

    // Smooth reveal of hero section
    gsap.from('.hero > *', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    });
});

// ===== Performance Optimization =====
// Pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gsap.globalTimeline.pause();
    } else {
        gsap.globalTimeline.resume();
    }
});

// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(0.01);
}

// ===== Easter Egg: Konami Code =====
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiPattern.join('')) {
        // Trigger special animation
        gsap.to('body', {
            filter: 'hue-rotate(180deg)',
            duration: 2,
            yoyo: true,
            repeat: 1
        });
    }
});
