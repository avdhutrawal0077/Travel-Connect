/* =========================================================
   Landing + Auth System
   Three.js Earth, GSAP scroll-driven animation, Auth modal
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Three.js Scene Setup ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    var container = document.getElementById('canvas-container');
    if (!container) return; // Guard: if landing layer missing, skip

    // Enable scrolling for the landing page scroll-driven animation
    // (body has overflow:hidden by default for the main app layout)
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';

    // Hide the main app's SVG background during landing
    var svgBgLayer = document.querySelector('.svg-bg-layer');
    if (svgBgLayer) svgBgLayer.style.display = 'none';

    // Hide floating chat system during landing (it lives outside .app-layout)
    var floatingChat = document.getElementById('floatingChatSystem');
    if (floatingChat) floatingChat.style.display = 'none';

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Milky Way Skybox ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    (function createSkybox() {
        var skyGeom = new THREE.SphereGeometry(900, 32, 32);
        var skyMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.35,
        });
        var skybox = new THREE.Mesh(skyGeom, skyMat);
        skybox.rotation.x = 0.3;
        skybox.rotation.z = 0.15;
        scene.add(skybox);

        var skyLoader = new THREE.TextureLoader();
        skyLoader.load(
            'https://unpkg.com/three-globe@2.31.1/example/img/night-sky.png',
            function (texture) {
                skyMat.map = texture;
                skyMat.needsUpdate = true;
            },
            undefined,
            function () {
                console.warn('Milky Way texture failed ΓÇö starfield only.');
            }
        );
    })();

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Layered Starfield ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    // Layer 1: small, dim, distant stars
    (function (count, minSize, maxSize, opacity, radiusMin, radiusMax) {
        var positions = new Float32Array(count * 3);
        var colors = new Float32Array(count * 3);

        for (var i = 0; i < count; i++) {
            var radius = radiusMin + Math.random() * (radiusMax - radiusMin);
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            var temp = Math.random();
            if (temp < 0.3) {
                colors[i * 3] = 0.8 + Math.random() * 0.15;
                colors[i * 3 + 1] = 0.85 + Math.random() * 0.1;
                colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
            } else if (temp < 0.6) {
                var w = 0.9 + Math.random() * 0.1;
                colors[i * 3] = w;
                colors[i * 3 + 1] = w;
                colors[i * 3 + 2] = w;
            } else {
                colors[i * 3] = 0.95 + Math.random() * 0.05;
                colors[i * 3 + 1] = 0.88 + Math.random() * 0.1;
                colors[i * 3 + 2] = 0.75 + Math.random() * 0.15;
            }
        }

        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        var mat = new THREE.PointsMaterial({
            size: minSize + (maxSize - minSize) * 0.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
        });

        scene.add(new THREE.Points(geom, mat));
    })(3500, 0.4, 1.0, 0.5, 300, 800);

    // Layer 2: brighter highlight stars
    (function (count, minSize, maxSize, opacity, radiusMin, radiusMax) {
        var positions = new Float32Array(count * 3);
        var colors = new Float32Array(count * 3);

        for (var i = 0; i < count; i++) {
            var radius = radiusMin + Math.random() * (radiusMax - radiusMin);
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            var bw = 0.9 + Math.random() * 0.1;
            colors[i * 3] = bw;
            colors[i * 3 + 1] = bw;
            colors[i * 3 + 2] = 0.92 + Math.random() * 0.08;
        }

        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        var mat = new THREE.PointsMaterial({
            size: minSize + (maxSize - minSize) * 0.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
        });

        scene.add(new THREE.Points(geom, mat));
    })(600, 1.2, 2.2, 0.7, 250, 700);

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Lighting ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    var ambientLight = new THREE.AmbientLight(0x222233, 0.12);
    scene.add(ambientLight);

    var sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    sunLight.position.set(5, 2, 4);
    scene.add(sunLight);

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Earth Sphere ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    var earthRadius = 1.6;
    var geometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    var material = new THREE.MeshPhongMaterial({
        color: 0x2255aa,
        emissive: 0x0a0a14,
        emissiveIntensity: 0.08,
        shininess: 25,
        specular: 0x333333,
    });

    var earth = new THREE.Mesh(geometry, material);
    earth.scale.set(1.0, 1.0, 1.0);
    scene.add(earth);

    // Load 2K Earth texture
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
        function (texture) {
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            material.map = texture;
            material.color.set(0xffffff);
            material.emissive.set(0x050510);
            material.needsUpdate = true;
        },
        undefined,
        function () {
            console.warn('Earth texture failed to load ΓÇö using procedural material.');
        }
    );

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Rotation State ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    var rotationState = { speed: 0.0015 };

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Responsive Resize ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Render Loop ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    var landingActive = true;

    function animate() {
        if (!landingActive) return; // Stop render loop after transition
        requestAnimationFrame(animate);
        earth.rotation.y += rotationState.speed;
        renderer.render(scene, camera);
    }
    animate();

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ GSAP ScrollTrigger Timeline ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

    gsap.registerPlugin(ScrollTrigger);

    var cards = document.querySelectorAll('#overlay .info-card');
    var ctaButtons = document.getElementById('cta-buttons');

    // Master timeline ΓÇö scrub: true for direct 1:1 scroll tracking
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#scroll-container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
        },
    });

    // ΓòÉΓòÉΓòÉ EARTH ANIMATION ΓÇö 0% to 50% ΓòÉΓòÉΓòÉ

    tl.to(earth.position, { y: -1.4, duration: 0.25, ease: 'none' }, 0);
    tl.to(earth.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.175, ease: 'none' }, 0);

    tl.to(earth.position, { y: -2.0, duration: 0.125, ease: 'none' }, 0.25);

    tl.to(earth.scale, { x: 2.34, y: 1.81, z: 2.34, duration: 0.125, ease: 'none' }, 0.375);
    tl.to(earth.position, { y: -3.4, duration: 0.125, ease: 'none' }, 0.375);
    tl.to(rotationState, { speed: 0, duration: 0.125, ease: 'none' }, 0.375);

    // ΓòÉΓòÉΓòÉ TITLE TEXT ΓòÉΓòÉΓòÉ

    var titleEl = document.getElementById('title-text');

    gsap.set(titleEl, { top: '50%', scale: 0.15, opacity: 0, xPercent: -50, yPercent: -50 });

    tl.to(titleEl, {
        top: '14%',
        scale: 1,
        opacity: 1,
        duration: 0.15,
        ease: 'power2.out',
        onUpdate: function () {
            var currentTop = parseFloat(gsap.getProperty(titleEl, 'top'));
            var viewH = window.innerHeight;
            if (currentTop < viewH * 0.35) {
                titleEl.style.zIndex = '5';
            } else {
                titleEl.style.zIndex = '1';
            }
        },
    }, 0);

    tl.to(titleEl, {
        opacity: 0,
        top: '8%',
        scale: 0.9,
        duration: 0.08,
        ease: 'power2.in',
        onComplete: function () { titleEl.style.zIndex = '1'; },
    }, 0.42);

    // ΓòÉΓòÉΓòÉ INFO CARDS ΓÇö 52% to 88% ΓòÉΓòÉΓòÉ

    var cardCount = cards.length;
    var cardsStart = 0.52;
    var cardsEnd = 0.88;
    var totalCardRange = cardsEnd - cardsStart;
    var perCard = totalCardRange / cardCount;

    var enterDur = 0.025;
    var exitDur = 0.02;

    cards.forEach(function (card, i) {
        var cardStart = cardsStart + i * perCard;
        var cardEnd = cardStart + perCard;

        var enterX = (i % 2 === 0) ? -80 : 80;

        tl.fromTo(
            card,
            { opacity: 0, x: enterX, y: 30 },
            { opacity: 1, x: 0, y: 0, duration: enterDur, ease: 'power1.out' },
            cardStart
        );

        tl.to(
            card,
            { opacity: 0, y: -30, duration: exitDur, ease: 'power1.in' },
            cardEnd - exitDur
        );
    });

    // ΓòÉΓòÉΓòÉ CTA BUTTONS ΓÇö 90% to 97% ΓòÉΓòÉΓòÉ

    tl.fromTo(
        ctaButtons,
        { opacity: 0, y: 24 },
        {
            opacity: 1,
            y: 0,
            duration: 0.07,
            ease: 'power1.out',
            onStart: function () { ctaButtons.classList.add('active'); },
            onReverseComplete: function () { ctaButtons.classList.remove('active'); },
        },
        0.92
    );

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // AUTH MODAL SYSTEM
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ

    var authBackdrop = document.getElementById('auth-backdrop');
    var authModal = document.getElementById('auth-modal');
    var panelLogin = document.getElementById('panel-login');
    var panelForgot = document.getElementById('panel-forgot');
    var panelForgotOtp = document.getElementById('panel-forgot-otp');
    var panelNewpass = document.getElementById('panel-newpass');
    var panelSignup1 = document.getElementById('panel-signup-1');
    var panelSignup2 = document.getElementById('panel-signup-2');

    function showPanel(panel) {
        [panelLogin, panelForgot, panelForgotOtp, panelNewpass, panelSignup1, panelSignup2].forEach(function (p) {
            p.classList.remove('active');
        });
        panel.classList.add('active');
    }

    function validatePasswordPair(password, confirmPassword) {
        if (!password || !confirmPassword) {
            return { ok: false, error: 'Please fill in both fields' };
        }
        if (password !== confirmPassword) {
            return { ok: false, error: 'Passwords do not match' };
        }
        return { ok: true, error: '' };
    }

    function clearFieldValues(ids) {
        ids.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });
    }

    function handlePasswordConfirmation(opts) {
        var passEl = document.getElementById(opts.passwordId);
        var confirmEl = document.getElementById(opts.confirmId);
        var errorEl = document.getElementById(opts.errorId);
        if (!passEl || !confirmEl || !errorEl) return;

        var validation = validatePasswordPair(passEl.value, confirmEl.value);
        errorEl.textContent = validation.error;
        if (!validation.ok) return;

        if (typeof opts.onValid === 'function') {
            opts.onValid();
        }
    }

    function openAuth(panel) {
        showPanel(panel);
        authBackdrop.classList.add('visible');
        authModal.classList.add('visible');
    }

    function openLoginFromUrlFlag() {
        var params = new URLSearchParams(window.location.search);
        if (params.get('auth') !== 'login') return;
        openAuth(panelLogin);
        params.delete('auth');
        var cleanQuery = params.toString();
        var cleanUrl = window.location.pathname + (cleanQuery ? ('?' + cleanQuery) : '') + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
    }

    function startForgotPasswordFlow(options) {
        var opts = options || {};
        var fromPanel = opts.fromPanel || null;
        var shouldAnimate = opts.animate !== false;

        clearFieldValues(['forgot-email', 'forgot-otp', 'newpass-password', 'newpass-confirm']);
        document.getElementById('newpass-error').textContent = '';

        if (authModal.classList.contains('visible')) {
            if (fromPanel && shouldAnimate) {
                switchPanel(fromPanel, panelForgot);
            } else {
                showPanel(panelForgot);
            }
            return;
        }

        openAuth(panelForgot);
    }

    window.startForgotPasswordFlow = startForgotPasswordFlow;

    function closeAuth() {
        authBackdrop.classList.remove('visible');
        authModal.classList.remove('visible');
    }

    function switchPanel(from, to) {
        gsap.to(authModal, {
            opacity: 0,
            scale: 0.95,
            duration: 0.15,
            ease: 'power2.in',
            onComplete: function () {
                showPanel(to);
                gsap.to(authModal, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.out',
                });
            },
        });
    }

    // ΓöÇΓöÇ CTA button handlers ΓöÇΓöÇ
    document.getElementById('btn-login').addEventListener('click', function (e) {
        e.preventDefault();
        openAuth(panelLogin);
    });

    document.getElementById('btn-signup').addEventListener('click', function (e) {
        e.preventDefault();
        openAuth(panelSignup1);
    });

    // ΓöÇΓöÇ Top-right landing nav buttons ΓöÇΓöÇ
    document.getElementById('nav-login').addEventListener('click', function (e) {
        e.preventDefault();
        openAuth(panelLogin);
    });

    document.getElementById('nav-signup').addEventListener('click', function (e) {
        e.preventDefault();
        openAuth(panelSignup1);
    });

    // ΓöÇΓöÇ Panel navigation links ΓöÇΓöÇ
    document.getElementById('go-signup').addEventListener('click', function (e) {
        e.preventDefault();
        switchPanel(panelLogin, panelSignup1);
    });

    document.getElementById('go-login-1').addEventListener('click', function (e) {
        e.preventDefault();
        switchPanel(panelSignup1, panelLogin);
    });

    document.getElementById('go-login-2').addEventListener('click', function (e) {
        e.preventDefault();
        switchPanel(panelSignup2, panelLogin);
    });

    // ΓöÇΓöÇ Forgot password navigation ΓöÇΓöÇ
    document.getElementById('go-forgot').addEventListener('click', function (e) {
        e.preventDefault();
        startForgotPasswordFlow({ fromPanel: panelLogin, animate: true });
    });

    document.getElementById('go-login-forgot-email').addEventListener('click', function (e) {
        e.preventDefault();
        switchPanel(panelForgot, panelLogin);
    });

    document.getElementById('go-login-forgot-otp').addEventListener('click', function (e) {
        e.preventDefault();
        switchPanel(panelForgotOtp, panelLogin);
    });

    // ── Send OTP (Email step) → OTP verify panel ──
    document.getElementById('forgot-send-otp').addEventListener('click', async function (e) {
        e.preventDefault();
        var email = document.getElementById('forgot-email').value.trim();
        if (!email) return;
        
        try {
            let res = await fetch('http://127.0.0.1:5000/api/auth/forgot-password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            let data = await res.json();
            if (res.ok) {
                switchPanel(panelForgot, panelForgotOtp);
            } else {
                alert(data.message || 'Error sending OTP');
            }
        } catch(err) {
            console.error(err);
            alert('Network error');
        }
    });

    // ── OTP Verify → New Password panel ──
    document.getElementById('forgot-verify-otp').addEventListener('click', async function (e) {
        e.preventDefault();
        var email = document.getElementById('forgot-email').value.trim();
        var otp = document.getElementById('forgot-otp').value.trim();
        if (!otp) return;
        
        try {
            let res = await fetch('http://127.0.0.1:5000/api/auth/forgot-password/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, otp: otp })
            });
            let data = await res.json();
            if (res.ok) {
                switchPanel(panelForgotOtp, panelNewpass);
            } else {
                alert(data.message || 'Invalid OTP');
            }
        } catch(err) {
            console.error(err);
            alert('Network error');
        }
    });

    // ── New Password → Confirm & go to Login ──
    document.getElementById('newpass-submit').addEventListener('click', function (e) {
        e.preventDefault();
        handlePasswordConfirmation({
            passwordId: 'newpass-password',
            confirmId: 'newpass-confirm',
            errorId: 'newpass-error',
            onValid: async function () {
                var email = document.getElementById('forgot-email').value.trim();
                var otp = document.getElementById('forgot-otp').value.trim();
                var newPassword = document.getElementById('newpass-password').value;
                
                try {
                    let res = await fetch('http://127.0.0.1:5000/api/auth/forgot-password/reset', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email, otp: otp, new_password: newPassword })
                    });
                    let data = await res.json();
                    if (res.ok) {
                        alert(data.message || 'Password reset successfully');
                        clearFieldValues(['newpass-password', 'newpass-confirm', 'forgot-email', 'forgot-otp']);
                        switchPanel(panelNewpass, panelLogin);
                    } else {
                        document.getElementById('newpass-error').textContent = data.message || 'Error resetting password';
                    }
                } catch(err) {
                    console.error(err);
                    document.getElementById('newpass-error').textContent = 'Network error';
                }
            },
        });
    });

    document.getElementById('go-login-newpass').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('newpass-error').textContent = '';
        switchPanel(panelNewpass, panelLogin);
    });

    // ΓöÇΓöÇ Signup step navigation ΓöÇΓöÇ
    document.getElementById('signup-next').addEventListener('click', function (e) {
        e.preventDefault();
        switchPanel(panelSignup1, panelSignup2);
    });

    // ΓöÇΓöÇ Backdrop click to close ΓöÇΓöÇ
    authBackdrop.addEventListener('click', function () {
        closeAuth();
    });

    openLoginFromUrlFlag();

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // POST-AUTH TRANSITION
    // Landing ΓåÆ Loader ΓåÆ Main App
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ

    var loaderTriggered = false;

    function triggerLoader() {
        if (loaderTriggered) return;
        loaderTriggered = true;

        var overlay = document.getElementById('overlay');
        var scrollContainer = document.getElementById('scroll-container');
        var loader = document.getElementById('loader');
        var appLayout = document.querySelector('.app-layout');
        var svgBg = document.querySelector('.svg-bg-layer');

        var exitTl = gsap.timeline();

        // 1. Fade out auth modal
        exitTl.to(authModal, {
            opacity: 0,
            scale: 0.92,
            duration: 0.4,
            ease: 'power2.inOut',
        }, 0);

        exitTl.to(authBackdrop, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: function () {
                authBackdrop.classList.remove('visible');
                authModal.classList.remove('visible');
            },
        }, 0);

        // 2. Fade out landing UI
        exitTl.to('#title-text', { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
        exitTl.to('#card-container', { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
        exitTl.to('#cta-buttons', { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
        exitTl.to('#landing-nav', { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0);

        // 3. Dim canvas
        exitTl.to('#canvas-container', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
        }, 0);

        // 4. Show "Launching appΓÇª" loader after 0.6s
        exitTl.to(loader, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0.6);

        // 5. After loader visible, hide landing ΓåÆ show main app
        exitTl.call(function () {
            // Hide landing elements completely
            overlay.style.display = 'none';
            scrollContainer.style.display = 'none';
            loader.style.pointerEvents = 'none';

            // Stop Three.js render loop
            landingActive = false;

            // Kill all ScrollTrigger instances (clean up scroll driver)
            ScrollTrigger.getAll().forEach(function (st) { st.kill(); });

            // Restore main app scroll behavior (overflow:hidden ΓÇö main-content handles its own scroll)
            document.body.style.overflow = 'hidden';
        }, null, null, 1.3);

        // 6. Fade out loader and show main app
        exitTl.to(loader, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: function () {
                loader.style.display = 'none';
            },
        }, 1.5);

        // 7. Show app layout with fade-in
        exitTl.call(function () {
            if (svgBg) svgBg.style.display = '';
            appLayout.style.display = 'grid';
            appLayout.style.opacity = '0';

            // Show floating chat system
            var fc = document.getElementById('floatingChatSystem');
            if (fc) fc.style.display = '';

            gsap.to(appLayout, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
            });
        }, null, null, 1.6);
    }

    // u{2500}u{2500} API helper for base URL u{2500}u{2500}
    const API_BASE = 'http://127.0.0.1:5000/api';

    // u{2500}u{2500} Auth submit handlers u{2500}u{2500}
    document.getElementById('login-submit').addEventListener('click', async function (e) {
        e.preventDefault();
        var username = document.getElementById('login-username').value;
        var password = document.getElementById('login-password').value;
        try {
            let res = await fetch(API_BASE + '/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: username, password: password})
            });
            let data = await res.json();
            if(res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('username', data.username);
                localStorage.setItem('full_name', data.full_name);
                localStorage.setItem('email', data.email);
                localStorage.setItem('phone', data.phone);
                localStorage.setItem('about', data.about);
                triggerLoader();
                setTimeout(updateProfileUI, 1000);
            } else {
                alert(data.message || 'Login failed');
            }
        } catch(err) {
            console.error(err);
            alert('Error connecting to backend');
        }
    });

    document.getElementById('signup-submit').addEventListener('click', async function (e) {
        e.preventDefault();
        var name = document.getElementById('signup-name').value;
        var email = document.getElementById('signup-email').value;
        var gender = document.getElementById('signup-gender').value;
        var dob = document.getElementById('signup-dob').value;
        var phone = document.getElementById('signup-phone').value;
        var username = document.getElementById('signup-username').value;
        var password = document.getElementById('signup-password').value;
        var confirm = document.getElementById('signup-confirm').value;

        if (password !== confirm) {
            alert("Passwords don't match");
            return;
        }

        try {
            let res = await fetch(API_BASE + '/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: email,
                    user_id: username,
                    password: password,
                    full_name: name,
                    phone: phone,
                    gender: gender,
                    dob: dob
                })
            });
            let data = await res.json();
            if(res.ok) {
                alert('Registration successful! Please login.');
                document.getElementById('go-login-2').click();
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch(err) {
            console.error(err);
            alert('Error connecting to backend');
        }
    });

}); // end DOMContentLoaded


/**
 * Premium Desktop UI - Interactive JavaScript
 * Handles page transitions, chat interactions, and animations
 */


(function () {
    'use strict';

    // Current user identity
    const CURRENT_USER_ID = localStorage.getItem('username') || 'yogiraj-kulkarni';
    
    window.updateProfileUI = function() {
        const USER_FULL_NAME = localStorage.getItem('full_name') || 'Yogiraj Kulkarni';
        const USER_HANDLE = localStorage.getItem('username') || 'yogiraj-kulkarni';
        const USER_INITIALS = USER_FULL_NAME.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

        document.querySelectorAll('.account-name, #lpName, #previewPostName').forEach(el => {
            el.textContent = USER_FULL_NAME;
        });
        
        document.querySelectorAll('.sidebar-nav .avatar-initials, .account-profile .avatar-initials, .style-demo').forEach(el => {
            el.textContent = USER_INITIALS;
        });
        
        document.querySelectorAll('.account-email').forEach(el => {
            el.textContent = localStorage.getItem('email') || (USER_HANDLE + '@example.com');
        });

        const accountPhone = document.getElementById('accountPhoneDisplay');
        if (accountPhone) accountPhone.textContent = localStorage.getItem('phone') || '+91 98765 43210';

        const accountBio = document.getElementById('accountBioDisplay');
        if (accountBio) accountBio.textContent = localStorage.getItem('about') || 'Exploring the world, one ride at a time \uD83C\uDF0D';
    };
    
    // Call it immediately on load if already logged in
    if(localStorage.getItem('token')) {
        updateProfileUI();
    }

    // Configuration
    const CONFIG = {
        animationDuration: 400,
        staggerDelay: 100,
        pageTransitionDuration: 320,
        observerThreshold: 0.2,
        easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    };

    // DOM Elements
    const elements = {
        postCards: document.querySelectorAll('.post-card[data-animate="pop-in"]'),
        sidebarNavItems: document.querySelectorAll('.sidebar-nav-item'),
        notificationBtn: document.querySelector('.notification-btn'),
        mainContent: document.querySelector('.main-content'),
        pageContainers: document.querySelectorAll('.page-container'),
        inboxItems: document.querySelectorAll('.inbox-item'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
    };

    let currentPage = 'home';

    // ============================================
    // Page Navigation
    // ============================================
    function initPageNavigation() {
        elements.sidebarNavItems.forEach(item => {
            item.addEventListener('click', function () {
                const targetTab = this.dataset.tab;
                if (targetTab === currentPage) return;

                elements.sidebarNavItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                transitionToPage(targetTab);
                createRipple(this);
            });
        });
    }

    function transitionToPage(newPage) {
        const currentPageEl = document.getElementById(`page-${currentPage}`);
        const newPageEl = document.getElementById(`page-${newPage}`);

        if (!currentPageEl || !newPageEl) return;

        // Start exit on current page
        currentPageEl.classList.add('exiting');
        currentPageEl.classList.remove('active');

        // Force reflow so the new page starts from its hidden transform state
        void newPageEl.offsetWidth;

        // Enter new page immediately ΓÇö both transitions run in parallel
        newPageEl.classList.add('active');
        currentPage = newPage;

        // Reset main-content scroll position so the new page starts at the top
        if (elements.mainContent) {
            elements.mainContent.scrollTop = 0;
        }

        // Widen main-content grid column for the chat page
        if (elements.mainContent) {
            elements.mainContent.classList.toggle('chat-active', newPage === 'chat');
        }

        // Switch app-layout grid to 2-column mode for chat
        const appLayout = document.querySelector('.app-layout');
        if (appLayout) {
            appLayout.classList.toggle('chat-grid', newPage === 'chat');
        }

        if (newPage === 'home') {
            reinitializeHomeAnimations();
        } else if (newPage === 'chat') {
            scrollToLatestMessage();
        } else if (newPage === 'booked') {
            renderBookedRides();
        } else if (newPage === 'history') {
            renderCompletedHistory();
        }

        // Clean up exiting class after transition completes
        setTimeout(() => {
            currentPageEl.classList.remove('exiting');
        }, CONFIG.pageTransitionDuration);
    }

    function reinitializeHomeAnimations() {
        const cards = document.querySelectorAll('#page-home .post-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
                card.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
            }, index * CONFIG.staggerDelay);
        });
    }

    // ============================================
    // Scroll Animations
    // ============================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: CONFIG.observerThreshold,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        entry.target.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
                    }, index * CONFIG.staggerDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.postCards.forEach(card => observer.observe(card));
    }

    // ============================================
    // Ripple Effect
    // ============================================
    function createRipple(element) {
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: scale(0);
            animation: ripple-effect 600ms ease-out forwards;
            pointer-events: none;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
        `;
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    function addRippleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-effect {
                to { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // Route Search Bar
    // ============================================
    function initRouteSearchBar() {
        const searchBar = document.getElementById('routeSearchBar');
        const fromInput = document.getElementById('routeFromInput');
        const toInput = document.getElementById('routeToInput');
        const swapBtn = document.getElementById('routeSwapBtn');

        if (!searchBar) return;

        // Light sweep on focus
        let sweepTimeout;
        function triggerSweep() {
            searchBar.classList.remove('sweep-active');
            void searchBar.offsetWidth; // force reflow
            searchBar.classList.add('sweep-active');
            clearTimeout(sweepTimeout);
            sweepTimeout = setTimeout(() => {
                searchBar.classList.remove('sweep-active');
            }, 1100);
        }

        if (fromInput) fromInput.addEventListener('focus', triggerSweep);
        if (toInput) toInput.addEventListener('focus', triggerSweep);

        // Swap values
        if (swapBtn && fromInput && toInput) {
            swapBtn.addEventListener('click', () => {
                const temp = fromInput.value;
                fromInput.value = toInput.value;
                toInput.value = temp;
                swapBtn.classList.toggle('swapped');
                triggerSweep();
            });
        }
    }

    // ============================================
    // Post Card - Animate Vehicle
    // ============================================
    function initAddressToggle() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.route-address-btn');
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            const strip = btn.closest('.route-strip');
            if (!strip) return;

            const details = strip.querySelector('.route-address-details');
            if (!details) return;

            const isExpanded = strip.classList.contains('expanded');

            if (isExpanded) {
                springCollapseAddress(details, strip);
            } else {
                // Collapse any other expanded address first
                document.querySelectorAll('.route-strip.expanded').forEach(other => {
                    if (other !== strip) {
                        const otherDetails = other.querySelector('.route-address-details');
                        if (otherDetails) springCollapseAddress(otherDetails, other);
                    }
                });
                springExpandAddress(details, strip);
            }
        });
    }

    function springExpandAddress(el, strip) {
        el.style.height = 'auto';
        el.style.opacity = '1';
        el.style.paddingTop = '10px';
        const targetHeight = el.scrollHeight;
        el.style.height = '0px';
        el.style.opacity = '0';
        el.style.paddingTop = '0';
        el.offsetHeight; // force reflow

        const keyframes = generateSpringKeyframes(0, targetHeight, {
            stiffness: 260,
            damping: 22,
            mass: 1,
            steps: 60,
            duration: 400,
        });

        keyframes.forEach((kf, i) => {
            kf.opacity = i < 8 ? (i / 8) : 1;
            kf.paddingTop = '10px';
        });

        strip.classList.add('expanded');

        const anim = el.animate(keyframes, {
            duration: 400,
            easing: 'linear',
            fill: 'forwards',
        });

        anim.onfinish = () => {
            el.style.height = 'auto';
            el.style.opacity = '1';
            el.style.paddingTop = '10px';
            anim.cancel();
        };
    }

    function springCollapseAddress(el, strip) {
        const currentHeight = el.scrollHeight;

        const keyframes = generateSpringKeyframes(currentHeight, 0, {
            stiffness: 260,
            damping: 26,
            mass: 1,
            steps: 50,
            duration: 340,
        });

        keyframes.forEach((kf, i, arr) => {
            const progress = i / (arr.length - 1);
            kf.opacity = progress > 0.6 ? 1 - ((progress - 0.6) / 0.4) : 1;
            kf.paddingTop = progress > 0.85 ? '0px' : '10px';
        });

        const anim = el.animate(keyframes, {
            duration: 340,
            easing: 'linear',
            fill: 'forwards',
        });

        anim.onfinish = () => {
            strip.classList.remove('expanded');
            el.style.height = '0';
            el.style.opacity = '0';
            el.style.paddingTop = '0';
            anim.cancel();
        };
    }

    // ============================================
    // Register Button - Opens Modal
    // ============================================
    function initRegisterButtons() {
        const registerWrappers = document.querySelectorAll('.register-wrapper');

        registerWrappers.forEach(wrapper => {
            const button = wrapper.querySelector('.register-btn');

            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Prevent action during animation states
                if (wrapper.classList.contains('registering') || wrapper.classList.contains('deregistering')) {
                    return;
                }

                const isRegistered = wrapper.classList.contains('registered');

                if (isRegistered) {
                    // Deregister: registered text goes down with red glow
                    wrapper.classList.add('deregistering');
                    wrapper.classList.remove('registered');

                    // Remove from localStorage
                    const postCard = wrapper.closest('.post-card');
                    const postId = postCard ? postCard.getAttribute('data-post-id') : null;
                    if (postId) removeBookedRide(postId);

                    // Update seat status UI
                    if (postCard) updateSeatStatusUI(postCard);

                    setTimeout(() => {
                        wrapper.classList.remove('deregistering');
                    }, 400);
                } else {
                    // Check seat availability before opening modal
                    const postCard = wrapper.closest('.post-card');
                    if (postCard) {
                        const postId = postCard.getAttribute('data-post-id');
                        const vehicleType = postCard.getAttribute('data-vehicle-type') || 'car';
                        const seatInfo = getSeatInfo(postId, vehicleType);
                        if (seatInfo.isFull) return; // Seats full, don't open modal
                    }
                    openRideModal(postCard, wrapper);
                }
            });
        });
    }

    // ============================================
    // Ride Registration Modal
    // ============================================
    let currentModalWrapper = null;
    let paymentStep = 1; // 1 = Proceed to Register, 2 = Confirm Registration

    function initRideModal() {
        const modal = document.getElementById('rideModal');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalProceed = document.getElementById('modalProceed');

        if (!modal) return;

        // Close button (X) - cancel animation
        modalClose.addEventListener('click', () => closeRideModal('cancel'));
        modalCancel.addEventListener('click', () => closeRideModal('cancel'));

        // Click outside to close - cancel animation
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRideModal('cancel');
        });

        // Escape key to close - cancel animation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeRideModal('cancel');
            }
        });

        // Proceed/Confirm button
        modalProceed.addEventListener('click', handlePaymentFlow);
    }

    function openRideModal(postCard, wrapper) {
        const modal = document.getElementById('rideModal');
        const proceedBtn = document.getElementById('modalProceed');
        const modalContent = document.getElementById('modalContent');
        const closeMessageOverlay = document.getElementById('closeMessageOverlay');

        if (!modal || !postCard) return;

        currentModalWrapper = wrapper;
        paymentStep = 1;

        // Reset modal state completely
        proceedBtn.textContent = 'Proceed to Register';
        proceedBtn.classList.remove('confirm');
        proceedBtn.disabled = false;
        if (modalContent) modalContent.style.display = 'block';
        if (closeMessageOverlay) closeMessageOverlay.classList.remove('active');

        // Extract data from post card
        const driverName = postCard.querySelector('.user-name')?.textContent || 'Driver';
        const driverInitials = postCard.querySelector('.avatar')?.textContent || 'DR';
        const fromLocation = postCard.querySelector('.route-point.start span')?.textContent || 'Start';
        const toLocation = postCard.querySelector('.route-point.end span')?.textContent || 'End';
        const amount = postCard.querySelector('.amount')?.textContent || '0';
        const vehicleType = postCard.querySelector('.mode-icon-badge span')?.textContent || 'Vehicle';

        // Calculate price breakdown
        const total = parseInt(amount) || 45;
        const baseFare = Math.round(total * 0.88);
        const platformFee = Math.round(total * 0.07);
        const tax = total - baseFare - platformFee;

        // Populate modal
        document.getElementById('modalDriverName').textContent = driverName;
        document.getElementById('modalDriverAvatar').textContent = driverInitials;
        document.getElementById('modalFromLocation').textContent = fromLocation;
        document.getElementById('modalToLocation').textContent = toLocation;
        document.getElementById('modalVehicleType').textContent = vehicleType;
        document.getElementById('modalBaseFare').textContent = `Γé╣${baseFare}`;
        document.getElementById('modalPlatformFee').textContent = `Γé╣${platformFee}`;
        document.getElementById('modalTax').textContent = `Γé╣${tax}`;
        document.getElementById('modalTotal').textContent = `Γé╣${total}`;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeRideModal(type = 'cancel') {
        const modal = document.getElementById('rideModal');
        const modalContent = document.getElementById('modalContent');
        const closeMessageOverlay = document.getElementById('closeMessageOverlay');
        const closeMessageIcon = document.getElementById('closeMessageIcon');
        const closeMessageText = document.getElementById('closeMessageText');
        const cancelIcon = document.getElementById('cancelIcon');
        const successIcon = document.getElementById('successIcon');

        if (!modal) return;

        // Save wrapper reference before we reset it
        const wrapperToUpdate = currentModalWrapper;
        const isSuccess = type === 'success';

        // Hide main content
        if (modalContent) modalContent.style.display = 'none';

        // Configure icon and text based on type
        if (isSuccess) {
            closeMessageIcon.classList.remove('cancel');
            closeMessageIcon.classList.add('success');
            cancelIcon.classList.add('hidden');
            successIcon.classList.remove('hidden');
            closeMessageText.textContent = 'Done';
            closeMessageText.classList.remove('cancel');
            closeMessageText.classList.add('success');
        } else {
            closeMessageIcon.classList.remove('success');
            closeMessageIcon.classList.add('cancel');
            cancelIcon.classList.remove('hidden');
            successIcon.classList.add('hidden');
            closeMessageText.textContent = 'Registration Canceled';
            closeMessageText.classList.remove('success');
            closeMessageText.classList.add('cancel');
        }

        // Add closing class based on type (triggers shrink animation - 0.25s)
        modal.classList.add(isSuccess ? 'closing-success' : 'closing-cancel');

        // Show the close message overlay immediately
        closeMessageOverlay.classList.add('active');

        // Play sound on success
        if (isSuccess) {
            playConfirmationSound();
        }

        // Show message for 2 seconds, then slide down
        setTimeout(() => {
            modal.classList.add('rolling');
        }, 2000);

        // After slide down completes, reset everything
        setTimeout(() => {
            modal.classList.remove('active', 'closing-cancel', 'closing-success', 'rolling');
            closeMessageOverlay.classList.remove('active');
            document.body.style.overflow = '';

            // Reset modal content and button
            if (modalContent) modalContent.style.display = 'block';
            const proceedBtn = document.getElementById('modalProceed');
            if (proceedBtn) {
                proceedBtn.textContent = 'Proceed to Register';
                proceedBtn.classList.remove('confirm', 'loading');
                proceedBtn.disabled = false;
            }

            // Reset icon visibility for next use
            cancelIcon.classList.remove('hidden');
            successIcon.classList.add('hidden');
            closeMessageIcon.classList.remove('cancel', 'success');

            // Update register button on success (use saved reference)
            if (isSuccess && wrapperToUpdate) {
                // Save to booked rides in localStorage
                const postCard = wrapperToUpdate.closest('.post-card');
                const postId = postCard ? postCard.getAttribute('data-post-id') : null;
                if (postId) addBookedRide(postId);

                wrapperToUpdate.classList.add('registering');

                setTimeout(() => {
                    wrapperToUpdate.classList.remove('registering');
                    wrapperToUpdate.classList.add('registered');
                    // Update seat status UI after registration
                    if (postCard) updateSeatStatusUI(postCard);
                }, 300);
            }

            currentModalWrapper = null;
            paymentStep = 1;
        }, 2600);
    }

    // macOS "Funky" alert sound recreation using Web Audio API
    function playConfirmationSound() {
        if (window.__appSettingsPermissions && window.__appSettingsPermissions.sounds === false) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // "Funky" is a bouncy, playful sound with descending notes
            const notes = [
                { freq: 1200, time: 0, duration: 0.08 },
                { freq: 900, time: 0.07, duration: 0.08 },
                { freq: 1100, time: 0.14, duration: 0.08 },
                { freq: 800, time: 0.21, duration: 0.12 }
            ];

            notes.forEach(note => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = note.freq;
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + note.time;
                gainNode.gain.setValueAtTime(0.25, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + note.duration);
            });
        } catch (e) {
            // Audio not supported, silently fail
        }
    }



    function handlePaymentFlow() {
        const proceedBtn = document.getElementById('modalProceed');

        if (paymentStep === 1) {
            // Step 1: Proceed to Register -> Show confirm button
            paymentStep = 2;
            proceedBtn.textContent = 'Confirm Registration';
            proceedBtn.classList.add('confirm');
        } else if (paymentStep === 2) {
            // Step 2: Confirm Registration -> Show loading, then success
            proceedBtn.disabled = true;
            proceedBtn.innerHTML = '<span class="btn-spinner"></span> Registering...';
            proceedBtn.classList.add('loading');

            // Wait 2 seconds with loading animation
            setTimeout(() => {
                closeRideModal('success');
            }, 2000);
        }
    }

    function showPaymentSuccess() {
        // This function is now deprecated in favor of the new closeRideModal('success')
        // Kept for backward compatibility
        closeRideModal('success');
    }

    // ============================================
    // Chat Functionality
    // ============================================
    function initChatInbox() {
        elements.inboxItems.forEach(item => {
            item.addEventListener('click', function () {
                elements.inboxItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                this.classList.remove('unread');

                const badge = this.querySelector('.inbox-badge');
                if (badge) {
                    badge.style.transform = 'scale(0)';
                    setTimeout(() => badge.remove(), 200);
                }
            });
        });
    }

    function scrollToLatestMessage() {
        if (elements.chatMessages) {
            setTimeout(() => {
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            }, 100);
        }
    }

    function initChatInput() {
        // Chat input is now handled by api.js which sends messages via the real backend API.
        // Adding Enter key support here since api.js only handles click.
        if (!elements.messageInput || !elements.sendBtn) return;

        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                elements.sendBtn.click();
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    // ============================================
    // Chat Conversation Data (for switching conversations)
    // ============================================
    const chatConversationData = {
        arjun: {
            name: 'Arjun Mehta',
            initials: 'AM',
            messages: [
                { type: 'received', text: 'Hey! Are we still on for tomorrow\'s ride to BKC?', time: '9:30 AM' },
                { type: 'sent', text: 'Yes, absolutely! I\'ll pick you up at 8:30 AM', time: '9:32 AM' },
                { type: 'received', text: 'Perfect! Should I wait at the usual spot near the metro station?', time: '9:33 AM' },
                { type: 'sent', text: 'Yes, same place as last time. I\'ll be in the white Honda City', time: '9:35 AM' },
                { type: 'received', text: 'Great! How much should I transfer for the ride?', time: '9:36 AM' },
                { type: 'sent', text: 'It\'s Γé╣45 for the bike ride, but since we\'re doing car pooling with 2 more people, it\'ll be just Γé╣35 per person ≡ƒæì', time: '9:38 AM' },
                { type: 'received', text: 'That\'s a good deal! I\'ll pay you in the morning', time: '9:40 AM' },
                { type: 'sent', text: 'No worries! You can also pay via UPI if that\'s easier', time: '9:41 AM' },
                { type: 'received', text: 'See you at 9 AM tomorrow!', time: '9:42 AM' },
            ]
        },
        priya: {
            name: 'Priya Sharma',
            initials: 'PS',
            messages: [
                { type: 'received', text: 'The ride was really smooth today!', time: '4:30 PM' },
                { type: 'sent', text: 'Glad you liked it! Same route tomorrow?', time: '4:32 PM' },
                { type: 'received', text: 'Thanks for the ride today ≡ƒÜù', time: '4:45 PM' },
            ]
        },
        rohan: {
            name: 'Rohan Kapoor',
            initials: 'RK',
            messages: [
                { type: 'sent', text: 'Sure, 8:30 AM works for me.', time: '3:00 PM' },
                { type: 'received', text: 'Actually, can we push it a bit?', time: '3:15 PM' },
                { type: 'received', text: 'Can we reschedule to Thursday?', time: '3:20 PM' },
            ]
        },
        neha: {
            name: 'Neha Kulkarni',
            initials: 'NK',
            messages: [
                { type: 'received', text: 'Are you leaving from Powai today?', time: '11:00 AM' },
                { type: 'sent', text: 'Yes, around 6 PM. Want to join?', time: '11:05 AM' },
                { type: 'received', text: 'I\'ll be waiting at the usual spot', time: '11:10 AM' },
            ]
        },
        vikram: {
            name: 'Vikram Rao',
            initials: 'VR',
            messages: [
                { type: 'received', text: 'That was a really nice drive', time: 'Yesterday' },
                { type: 'sent', text: 'Thanks! Happy to carpool anytime', time: 'Yesterday' },
                { type: 'received', text: 'Great driving today!', time: 'Yesterday' },
            ]
        },
        ananya: {
            name: 'Ananya Singh',
            initials: 'AS',
            messages: [
                { type: 'sent', text: 'I\'m on my way, about 10 min away', time: '2 days ago' },
                { type: 'received', text: 'Sure, take your time!', time: '2 days ago' },
                { type: 'received', text: 'Let me know when you reach', time: '2 days ago' },
            ]
        },
    };

    // ============================================
    // Direct Message from Post Cards
    // ============================================
    function openDirectMessage(chatId) {
        // 1. Navigate to chat tab
        elements.sidebarNavItems.forEach(nav => nav.classList.remove('active'));
        const chatNavBtn = document.querySelector('.sidebar-nav-item[data-tab="chat"]');
        if (chatNavBtn) chatNavBtn.classList.add('active');
        transitionToPage('chat');

        // 2. Look for existing inbox item
        let inboxItem = document.querySelector(`.inbox-item[data-chat="${chatId}"]`);
        const chatData = chatConversationData[chatId];

        // 3. If no inbox item exists, create one
        if (!inboxItem && chatData) {
            const inboxList = document.querySelector('.inbox-list');
            if (inboxList) {
                inboxItem = document.createElement('div');
                inboxItem.className = 'inbox-item';
                inboxItem.setAttribute('data-chat', chatId);
                inboxItem.innerHTML = `
                    <div class="inbox-avatar">${chatData.initials}</div>
                    <div class="inbox-info">
                        <span class="inbox-name">${escapeHtml(chatData.name)}</span>
                        <span class="inbox-preview">Start a conversation...</span>
                    </div>
                    <span class="inbox-time">Now</span>
                `;
                inboxList.prepend(inboxItem);

                // Wire up the click handler on the new inbox item
                inboxItem.addEventListener('click', function () {
                    document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    this.classList.remove('unread');
                    const badge = this.querySelector('.inbox-badge');
                    if (badge) {
                        badge.style.transform = 'scale(0)';
                        setTimeout(() => badge.remove(), 200);
                    }
                    loadChatConversation(this.getAttribute('data-chat'));
                });

                // Create empty conversation data if none exists
                if (!chatConversationData[chatId]) {
                    chatConversationData[chatId] = {
                        name: chatData.name,
                        initials: chatData.initials,
                        messages: []
                    };
                }
            }
        }

        // 4. Select the inbox item and load the conversation
        if (inboxItem) {
            document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
            inboxItem.classList.add('active');
            inboxItem.classList.remove('unread');
            const badge = inboxItem.querySelector('.inbox-badge');
            if (badge) {
                badge.style.transform = 'scale(0)';
                setTimeout(() => badge.remove(), 200);
            }
        }

        loadChatConversation(chatId);
    }

    function loadChatConversation(chatId) {
        const chatData = chatConversationData[chatId];
        if (!chatData) return;

        // Update chat header
        const chatUserAvatar = document.querySelector('.chat-user-avatar');
        const chatUserName = document.querySelector('.chat-user-name');
        const chatUserStatus = document.querySelector('.chat-user-status');

        if (chatUserAvatar) chatUserAvatar.textContent = chatData.initials;
        if (chatUserName) chatUserName.textContent = chatData.name;
        if (chatUserStatus) chatUserStatus.textContent = 'Active now';

        // Load messages
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        let messagesHTML = '<div class="message-date-separator"><span>Today</span></div>';

        if (chatData.messages.length === 0) {
            messagesHTML += `
                <div class="message-date-separator"><span>No messages yet. Say hello!</span></div>
            `;
        } else {
            chatData.messages.forEach(msg => {
                messagesHTML += `
                    <div class="message ${msg.type}">
                        <div class="message-bubble">${escapeHtml(msg.text)}</div>
                        <span class="message-time">${msg.time}</span>
                    </div>
                `;
            });
        }

        chatMessages.innerHTML = messagesHTML;
        scrollToLatestMessage();
    }

    function initDMButtons() {
        document.querySelectorAll('.post-dm-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const chatId = this.getAttribute('data-chat-id');
                if (chatId) openDirectMessage(chatId);
            });
        });

        // Also wire up inbox items to load conversations on click
        document.querySelectorAll('.inbox-item').forEach(item => {
            item.addEventListener('click', function () {
                const chatId = this.getAttribute('data-chat');
                if (chatId) loadChatConversation(chatId);
            });
        });
    }

    // ============================================
    // Creator Follow / Notification Subscription
    // ============================================
    function getFollowedCreators() {
        try {
            return JSON.parse(localStorage.getItem('followed_creators') || '[]');
        } catch { return []; }
    }

    function saveFollowedCreators(list) {
        localStorage.setItem('followed_creators', JSON.stringify(list));
    }

    function toggleFollowCreator(creatorId, btn) {
        let list = getFollowedCreators();
        const isFollowing = list.includes(creatorId);

        if (isFollowing) {
            list = list.filter(id => id !== creatorId);
            btn.classList.remove('active');
        } else {
            list.push(creatorId);
            btn.classList.add('active');
        }

        saveFollowedCreators(list);

        // Play ring animation
        btn.classList.add('ringing');
        setTimeout(() => btn.classList.remove('ringing'), 500);
    }

    function initFollowButtons() {
        const followedList = getFollowedCreators();

        document.querySelectorAll('.post-follow-btn').forEach(btn => {
            const creatorId = btn.getAttribute('data-creator-id');

            // Sync initial active state
            if (followedList.includes(creatorId)) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleFollowCreator(creatorId, this);
            });
        });
    }

    function notifyFollowers(creatorName, postData) {
        // Show a toast notification for the current user
        const toast = document.createElement('div');
        toast.className = 'follow-toast';
        toast.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke-width="2" />
            </svg>
            <span><strong>${escapeHtml(creatorName)}</strong> posted a new ride: ${escapeHtml(postData.pickup)} ΓåÆ ${escapeHtml(postData.destination)}</span>
        `;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }



    // ============================================
    // Notification Center
    // ============================================

    // ---- State Machine ----
    const notificationState = {
        isAnimating: false,        // prevents actions during transitions
        expandedWrapper: null,     // reference to the currently expanded wrapper
        savedScrollTop: 0,        // preserves scroll position
        isPanelOpen: false,       // tracks panel state
        lastToggleTime: 0,        // rapid-toggle cooldown timestamp
    };

    // Rapid-toggle guard: reject actions within cooldown window
    function canToggle() {
        const now = Date.now();
        if (now - notificationState.lastToggleTime < 300) return false;
        notificationState.lastToggleTime = now;
        return true;
    }

    // Utility: one-shot transitionend listener with safety timeout
    function onTransitionEnd(el, callback, safetyMs = 500) {
        let fired = false;
        const done = () => {
            if (fired) return;
            fired = true;
            el.removeEventListener('transitionend', handler);
            clearTimeout(timer);
            callback();
        };
        const handler = (e) => {
            if (e.target === el) done();
        };
        el.addEventListener('transitionend', handler);
        const timer = setTimeout(done, safetyMs);
    }

    function initNotificationButton() {
        const notificationBtn = document.querySelector('.notification-btn');
        const notificationPanel = document.getElementById('notificationPanel');
        const notificationOverlay = document.getElementById('notificationOverlay');
        const notificationClose = document.getElementById('notificationClose');
        const markAllReadBtn = document.getElementById('markAllRead');
        const mainContent = document.querySelector('.main-content');
        const sidebarNav = document.querySelector('.sidebar-nav');

        if (!notificationBtn || !notificationPanel) return;

        // Open notification panel
        function openNotificationPanel() {
            if (window.__appSettingsPermissions && window.__appSettingsPermissions.notifications === false) return;
            if (notificationState.isPanelOpen || notificationState.isAnimating) return;
            notificationState.isAnimating = true;
            notificationState.isPanelOpen = true;

            requestAnimationFrame(() => {
                notificationPanel.classList.add('active');
                notificationOverlay.classList.add('active');
                mainContent.classList.add('notification-open');
                sidebarNav.classList.add('notification-open');
                document.body.style.overflow = 'hidden';
            });

            // Hide the notification badge
            const badge = notificationBtn.querySelector('.notification-badge');
            if (badge) {
                badge.style.opacity = '0';
                badge.style.transform = 'scale(0)';
            }

            onTransitionEnd(notificationPanel, () => {
                notificationState.isAnimating = false;
            }, 500);
        }

        // Close notification panel
        function closeNotificationPanel() {
            if (!notificationState.isPanelOpen || notificationState.isAnimating) return;
            notificationState.isAnimating = true;

            // First collapse any expanded card
            const notificationList = notificationPanel.querySelector('.notification-list');
            if (notificationState.expandedWrapper) {
                const wrapper = notificationState.expandedWrapper;
                const card = wrapper.querySelector('.notification-card');
                if (card) card.classList.remove('replying');
                wrapper.classList.remove('expanded');
                if (notificationList) notificationList.classList.remove('has-expanded-card');
                notificationState.expandedWrapper = null;
                // Clear any reply inputs
                const input = wrapper.querySelector('.reply-input');
                if (input) input.value = '';
            }

            // Small delay to let card collapse start before panel slides out
            const delay = 50;
            setTimeout(() => {
                requestAnimationFrame(() => {
                    notificationPanel.classList.remove('active');
                    notificationOverlay.classList.remove('active');
                    mainContent.classList.remove('notification-open');
                    sidebarNav.classList.remove('notification-open');
                    document.body.style.overflow = '';
                    notificationState.isPanelOpen = false;
                });

                onTransitionEnd(notificationPanel, () => {
                    notificationState.isAnimating = false;
                }, 450);
            }, delay);
        }

        // Bell icon click
        notificationBtn.addEventListener('click', openNotificationPanel);

        // Close button click
        if (notificationClose) {
            notificationClose.addEventListener('click', closeNotificationPanel);
        }

        // Overlay click (close on outside click)
        if (notificationOverlay) {
            notificationOverlay.addEventListener('click', closeNotificationPanel);
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && notificationPanel.classList.contains('active')) {
                if (notificationState.isAnimating) return;
                // First close any expanded card, then panel if no card was expanded
                if (notificationState.expandedWrapper) {
                    collapseExpandedCard();
                } else {
                    closeNotificationPanel();
                }
            }
        });

        // Mark all as read
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                const unreadCards = document.querySelectorAll('.notification-card.unread');
                unreadCards.forEach((card, i) => {
                    // Stagger the animation for visual polish
                    setTimeout(() => {
                        card.classList.remove('unread');
                        card.classList.remove('new-message');
                        const dot = card.querySelector('.unread-dot');
                        if (dot) {
                            dot.style.opacity = '0';
                            dot.style.transform = 'scale(0)';
                            setTimeout(() => dot.remove(), 300);
                        }
                    }, i * 60);
                });
            });
        }

        // Initialize notification cards
        initNotificationCards();
    }

    // ============================================
    // Collapse the currently expanded card
    // ============================================
    function collapseExpandedCard(callback) {
        const wrapper = notificationState.expandedWrapper;
        if (!wrapper) {
            if (callback) callback();
            return;
        }

        const card = wrapper.querySelector('.notification-card');
        const notificationList = wrapper.closest('.notification-list');

        notificationState.isAnimating = true;

        // Spring-based collapse: add .collapsing first (sets 420ms transition + bounce keyframe),
        // then remove .expanded to trigger grid-template-rows 1fr ΓåÆ 0fr
        requestAnimationFrame(() => {
            if (card) card.classList.remove('replying');
            wrapper.classList.add('collapsing');

            // Next frame: remove expanded to trigger collapse transition
            requestAnimationFrame(() => {
                wrapper.classList.remove('expanded');
                if (notificationList) {
                    notificationList.classList.remove('has-expanded-card');
                }
                notificationState.expandedWrapper = null;

                // Wait for 400ms spring collapse animation to settle
                setTimeout(() => {
                    wrapper.classList.remove('collapsing');
                    notificationState.isAnimating = false;
                    if (callback) callback();
                }, 430); // 400ms + 30ms safety margin
            });
        });

        // Clear input
        const input = wrapper.querySelector('.reply-input');
        if (input) input.value = '';
    }

    // ============================================
    // Expand a card (unified for all types)
    // ============================================
    function expandCard(wrapper) {
        if (notificationState.isAnimating) return;
        notificationState.isAnimating = true;

        const notificationList = wrapper.closest('.notification-list');
        const card = wrapper.querySelector('.notification-card');

        requestAnimationFrame(() => {
            // Add sibling dimming class
            if (notificationList) {
                notificationList.classList.add('has-expanded-card');
            }

            // Expand via grid-template-rows 0fr ΓåÆ 1fr
            wrapper.classList.add('expanded');
            notificationState.expandedWrapper = wrapper;

            // After 450ms grid transition settles:
            // ΓÇô Message cards enter reply mode
            // ΓÇô Other cards just finish
            onTransitionEnd(wrapper, () => {
                if (card && card.dataset.type === 'message' && !card.classList.contains('replied')) {
                    card.classList.add('replying');
                    const input = card.querySelector('.reply-input');
                    if (input) input.focus();
                }
                notificationState.isAnimating = false;
            }, 500);
        });
    }

    // ============================================
    // Notification Card Interactions & Inline Reply
    // ============================================
    function initNotificationCards() {
        const cardWrappers = document.querySelectorAll('.notification-card-wrapper');

        cardWrappers.forEach(wrapper => {
            const card = wrapper.querySelector('.notification-card');
            if (!card) return;

            // General card click ΓÇö mark as read + handle expansion
            card.addEventListener('click', function (e) {
                // Don't trigger if clicking on reply elements or context preview
                if (e.target.closest('.reply-toggle-btn, .inline-reply-container, .reply-context-preview')) {
                    return;
                }

                // Guard against animation races
                if (notificationState.isAnimating || !canToggle()) return;

                // Mark as read
                this.classList.remove('unread');
                this.classList.remove('new-message');
                const dot = this.querySelector('.unread-dot');
                if (dot) {
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(0)';
                    setTimeout(() => dot.remove(), 300);
                }

                // Ripple glow effect
                createCardRipple(this, e);

                // Handle expansion ΓÇö unified for all card types
                if (wrapper.classList.contains('expanded')) {
                    // Clicking the same expanded card ΓÇö collapse it
                    collapseExpandedCard();
                } else if (notificationState.expandedWrapper) {
                    // Another card is expanded ΓÇö collapse it first, then expand this one
                    const wrapperToExpand = wrapper;
                    collapseExpandedCard(() => {
                        expandCard(wrapperToExpand);
                    });
                } else {
                    // No card expanded ΓÇö expand this one
                    expandCard(wrapper);
                }
            });

            // Reply toggle button (message cards only)
            const replyToggle = card.querySelector('.reply-toggle-btn');
            if (replyToggle) {
                replyToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (notificationState.isAnimating || !canToggle()) return;

                    if (card.classList.contains('replying')) {
                        // Toggle reply off but stay expanded
                        card.classList.remove('replying');
                    } else {
                        card.classList.add('replying');
                        const input = card.querySelector('.reply-input');
                        if (input) setTimeout(() => input.focus(), 300);
                    }
                });
            }

            // Reply send button
            const sendBtn = card.querySelector('.reply-send-btn');
            if (sendBtn) {
                sendBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sendReply(wrapper);
                });
            }

            // Reply cancel button
            const cancelBtn = card.querySelector('.reply-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (notificationState.isAnimating) return;
                    collapseExpandedCard();
                });
            }

            // Reply input ΓÇö enter to send, prevent propagation
            const replyInput = card.querySelector('.reply-input');
            if (replyInput) {
                replyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        sendReply(wrapper);
                    }
                });
                replyInput.addEventListener('click', (e) => e.stopPropagation());
            }

            // Emoji button ΓÇö prevent propagation (decorative for now)
            const emojiBtn = card.querySelector('.reply-emoji-btn');
            if (emojiBtn) {
                emojiBtn.addEventListener('click', (e) => e.stopPropagation());
            }
        });
    }

    // Ripple glow effect on card click
    function createCardRipple(card, event) {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);

        const ripple = document.createElement('div');
        ripple.className = 'ripple-ring';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';

        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Send reply ΓÇö simulates API call
    function sendReply(wrapper) {
        const card = wrapper.querySelector('.notification-card');
        const input = card?.querySelector('.reply-input');
        const message = input?.value.trim();

        if (!message) return;

        const chatId = card.dataset.chatId;
        const notificationList = wrapper.closest('.notification-list');

        // Set sending state ΓÇö remove replying but keep expanded
        card.classList.add('sending');
        card.classList.remove('replying');

        // Simulate sending (in a real app, this would be an API call)
        setTimeout(() => {
            requestAnimationFrame(() => {
                // Remove sending state and collapse
                card.classList.remove('sending');
                wrapper.classList.remove('expanded');

                // Remove sibling dimming
                if (notificationList) {
                    notificationList.classList.remove('has-expanded-card');
                    notificationList.scrollTop = notificationState.savedScrollTop;
                }
                notificationState.expandedWrapper = null;

                // Add to chat if chat section exists
                if (chatId) {
                    addMessageToChat(chatId, message);
                }

                // Show replied state
                card.classList.add('replied');

                // Mark as read
                card.classList.remove('unread', 'new-message');
                const dot = card.querySelector('.unread-dot');
                if (dot) {
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(0)';
                }

                // Clear input
                input.value = '';
                notificationState.isAnimating = false;
            });
        }, 800);
    }

    // Add message to chat thread
    function addMessageToChat(chatId, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // Create new message element
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message sent';
        msgDiv.innerHTML = `
            <div class="message-bubble">${escapeHtml(message)}</div>
            <span class="message-time">${getCurrentTime()}</span>
        `;

        chatMessages.appendChild(msgDiv);

        // Smooth scroll to bottom
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // ============================================
    // Menu Items
    // ============================================
    function initMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });

        const logoutItem = document.querySelector('.menu-item.logout');
        if (logoutItem) {
            logoutItem.addEventListener('click', function () {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (e) {
                    // Ignore storage-clear errors and continue logout flow.
                }

                // Force a clean frontend state and return to Login modal.
                window.location.href = window.location.pathname + '?auth=login';
            });
        }
    }

    // ============================================
    // Post Creation
    // ============================================
    let postDraft = {
        pickup: '',
        destination: '',
        vehicleType: 'bike',
        price: 0,
        seats: 1,
        departTime: '',
        arriveTime: '',
        pickupAddress: { street: '', area: '', pincode: '' },
        destAddress: { street: '', area: '', pincode: '' }
    };

    let editingPostId = null; // Track if we're editing an existing post

    // ============================================
    // Post Form - Address Sub-field Toggle
    // ============================================
    function initPostAddressToggle() {
        document.querySelectorAll('.post-address-toggle').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const targetId = this.getAttribute('data-target');
                const fieldsEl = document.getElementById(targetId);
                if (!fieldsEl) return;

                const isExpanded = fieldsEl.classList.contains('expanded');

                if (isExpanded) {
                    // Collapse
                    fieldsEl.style.height = fieldsEl.scrollHeight + 'px';
                    fieldsEl.offsetHeight;
                    fieldsEl.style.transition = 'height 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 280ms ease, padding 280ms ease';
                    fieldsEl.style.height = '0';
                    fieldsEl.classList.remove('expanded');
                    this.classList.remove('active');

                    fieldsEl.addEventListener('transitionend', function handler() {
                        fieldsEl.style.transition = '';
                        fieldsEl.removeEventListener('transitionend', handler);
                    });
                } else {
                    // Expand
                    fieldsEl.classList.add('expanded');
                    this.classList.add('active');

                    fieldsEl.style.height = 'auto';
                    const targetHeight = fieldsEl.scrollHeight;
                    fieldsEl.style.height = '0';
                    fieldsEl.offsetHeight;
                    fieldsEl.style.transition = 'height 330ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 330ms ease, padding 330ms ease';
                    fieldsEl.style.height = targetHeight + 'px';

                    fieldsEl.addEventListener('transitionend', function handler() {
                        fieldsEl.style.height = 'auto';
                        fieldsEl.style.transition = '';
                        fieldsEl.removeEventListener('transitionend', handler);
                    });
                }
            });
        });
    }

    function initPostCreation() {
        const pickupInput = document.getElementById('postPickup');
        const destinationInput = document.getElementById('postDestination');
        const priceInput = document.getElementById('postPrice');
        const seatsInput = document.getElementById('postSeats');
        const vehicleOptions = document.querySelectorAll('.vehicle-option');
        const previewBtn = document.getElementById('postPreviewBtn');
        const cancelBtn = document.getElementById('postCancelBtn');
        const editBtn = document.getElementById('previewEditBtn');
        const previewCancelBtn = document.getElementById('previewCancelBtn');
        const publishBtn = document.getElementById('publishPostBtn');
        const directPublishBtn = document.getElementById('postDirectPublishBtn');
        const departTimeInput = document.getElementById('postDepartTime');
        const arriveTimeInput = document.getElementById('postArriveTime');

        if (!pickupInput) return;

        // Text input validation (letters and spaces only)
        [pickupInput, destinationInput].forEach(input => {
            input.addEventListener('input', function () {
                const value = this.value;
                const isValid = /^[A-Za-z\s]*$/.test(value);

                if (!isValid) {
                    this.value = value.replace(/[^A-Za-z\s]/g, '');
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            });
        });

        // Price input validation (integers only)
        priceInput.addEventListener('input', function () {
            const value = this.value;
            const isValid = /^\d*$/.test(value);

            if (!isValid) {
                this.value = value.replace(/[^\d]/g, '');
                const wrapper = this.closest('.input-wrapper');
                if (wrapper) wrapper.classList.add('error');
            } else {
                const wrapper = this.closest('.input-wrapper');
                if (wrapper) wrapper.classList.remove('error');
            }
        });

        // Seats input validation (integers 1-3 only)
        if (seatsInput) {
            seatsInput.addEventListener('input', function () {
                const value = this.value;
                // Allow only digits
                this.value = value.replace(/[^\d]/g, '');
                const num = parseInt(this.value);
                const wrapper = this.closest('.input-wrapper');
                if (this.value && (num < 1 || num > 3)) {
                    if (wrapper) wrapper.classList.add('error');
                } else {
                    if (wrapper) wrapper.classList.remove('error');
                }
                // Clamp to max 3
                if (num > 3) this.value = '3';
            });
        }

        // Vehicle type selection
        vehicleOptions.forEach(option => {
            option.addEventListener('click', function () {
                vehicleOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                postDraft.vehicleType = this.dataset.vehicle;
            });
        });

        // Preview button
        if (previewBtn) {
            previewBtn.addEventListener('click', function () {
                const pickup = pickupInput.value.trim();
                const destination = destinationInput.value.trim();
                const price = parseInt(priceInput.value) || 0;
                const seats = parseInt(seatsInput?.value) || 0;

                // Validate all fields
                let isValid = true;

                if (!pickup) {
                    pickupInput.classList.add('error');
                    isValid = false;
                }
                if (!destination) {
                    destinationInput.classList.add('error');
                    isValid = false;
                }
                if (price < 1) {
                    const priceWrapper = priceInput.closest('.input-wrapper');
                    if (priceWrapper) priceWrapper.classList.add('error');
                    isValid = false;
                }
                if (seats < 1 || seats > 3) {
                    const seatsWrapper = seatsInput?.closest('.input-wrapper');
                    if (seatsWrapper) seatsWrapper.classList.add('error');
                    isValid = false;
                }

                // Validate time fields
                const departTime = departTimeInput ? departTimeInput.value : '';
                const arriveTime = arriveTimeInput ? arriveTimeInput.value : '';
                if (!departTime || !arriveTime) {
                    if (departTimeInput) departTimeInput.classList.add('error');
                    if (arriveTimeInput) arriveTimeInput.classList.add('error');
                    isValid = false;
                } else {
                    if (departTimeInput) departTimeInput.classList.remove('error');
                    if (arriveTimeInput) arriveTimeInput.classList.remove('error');
                }

                if (!isValid) return;

                // Save draft
                postDraft.pickup = pickup;
                postDraft.destination = destination;
                postDraft.price = price;
                postDraft.seats = seats;
                postDraft.departTime = departTime;
                postDraft.arriveTime = arriveTime;

                // Save address sub-fields
                postDraft.pickupAddress = {
                    street: (document.getElementById('pickupStreet')?.value || '').trim(),
                    area: (document.getElementById('pickupArea')?.value || '').trim(),
                    pincode: (document.getElementById('pickupPincode')?.value || '').trim()
                };
                postDraft.destAddress = {
                    street: (document.getElementById('destStreet')?.value || '').trim(),
                    area: (document.getElementById('destArea')?.value || '').trim(),
                    pincode: (document.getElementById('destPincode')?.value || '').trim()
                };

                // Update preview
                updatePostPreview();

                // Switch to preview step
                document.getElementById('postStepCreate').classList.remove('active');
                document.getElementById('postStepPreview').classList.add('active');
            });
        }

        // Cancel button (go to home)
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                resetPostForm();
                navigateToHome();
            });
        }

        // Edit button (back to create)
        if (editBtn) {
            editBtn.addEventListener('click', function () {
                document.getElementById('postStepPreview').classList.remove('active');
                document.getElementById('postStepCreate').classList.add('active');
            });
        }

        // Preview Cancel button
        if (previewCancelBtn) {
            previewCancelBtn.addEventListener('click', function () {
                resetPostForm();
                navigateToHome();
            });
        }

        if (publishBtn) {
            publishBtn.addEventListener('click', function () {
                if (publishBtn.disabled) return;
                const originalHTML = publishBtn.innerHTML;
                publishBtn.disabled = true;
                publishBtn.innerHTML = '<span class="btn-spinner"></span> Publishing...';
                setTimeout(() => {
                    publishPost();
                    publishBtn.disabled = false;
                    publishBtn.innerHTML = originalHTML;
                }, 800);
            });
        }

        // Direct Post button (validates, saves draft, publishes directly)
        if (directPublishBtn) {
            directPublishBtn.addEventListener('click', function () {
                const pickup = pickupInput.value.trim();
                const destination = destinationInput.value.trim();
                const price = parseInt(priceInput.value) || 0;
                const seats = seatsInput ? (parseInt(seatsInput.value) || 0) : 1;

                let isValid = true;

                if (!pickup) { pickupInput.classList.add('error'); isValid = false; }
                if (!destination) { destinationInput.classList.add('error'); isValid = false; }
                if (price < 1) {
                    const pw = priceInput.closest('.input-wrapper');
                    if (pw) pw.classList.add('error');
                    isValid = false;
                }
                if (seatsInput && (seats < 1 || seats > 3)) {
                    const sw = seatsInput.closest('.input-wrapper');
                    if (sw) sw.classList.add('error');
                    isValid = false;
                }

                const departTime = departTimeInput ? departTimeInput.value : '';
                const arriveTime = arriveTimeInput ? arriveTimeInput.value : '';
                if (!departTime || !arriveTime) {
                    if (departTimeInput) departTimeInput.classList.add('error');
                    if (arriveTimeInput) arriveTimeInput.classList.add('error');
                    isValid = false;
                } else {
                    if (departTimeInput) departTimeInput.classList.remove('error');
                    if (arriveTimeInput) arriveTimeInput.classList.remove('error');
                }

                if (!isValid) return;

                postDraft.pickup = pickup;
                postDraft.destination = destination;
                postDraft.price = price;
                postDraft.seats = seats;
                postDraft.departTime = departTime;
                postDraft.arriveTime = arriveTime;

                postDraft.pickupAddress = {
                    street: (document.getElementById('pickupStreet')?.value || '').trim(),
                    area: (document.getElementById('pickupArea')?.value || '').trim(),
                    pincode: (document.getElementById('pickupPincode')?.value || '').trim()
                };
                postDraft.destAddress = {
                    street: (document.getElementById('destStreet')?.value || '').trim(),
                    area: (document.getElementById('destArea')?.value || '').trim(),
                    pincode: (document.getElementById('destPincode')?.value || '').trim()
                };

                if (directPublishBtn.disabled) return;
                const originalHTML = directPublishBtn.innerHTML;
                directPublishBtn.disabled = true;
                directPublishBtn.innerHTML = '<span class="btn-spinner"></span> Posting...';
                setTimeout(() => {
                    publishPost();
                    directPublishBtn.disabled = false;
                    directPublishBtn.innerHTML = originalHTML;
                }, 800);
            });
        }
    }

    function formatTime12h(time24) {
        if (!time24) return '--:--';
        const [h, m] = time24.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
    }

    function updatePostPreview() {
        const previewPickup = document.getElementById('previewPickup');
        const previewDestination = document.getElementById('previewDestination');
        const previewPrice = document.getElementById('previewPrice');
        const previewSeats = document.getElementById('previewSeats');
        const previewSeatsPlural = document.getElementById('previewSeatsPlural');
        const previewVehicleBadge = document.getElementById('previewVehicleBadge');
        const previewVehicleLabel = document.getElementById('previewVehicleLabel');

        if (previewPickup) previewPickup.textContent = postDraft.pickup;
        if (previewDestination) previewDestination.textContent = postDraft.destination;
        if (previewPrice) previewPrice.textContent = postDraft.price;
        if (previewSeats) previewSeats.textContent = postDraft.seats;
        if (previewSeatsPlural) previewSeatsPlural.textContent = postDraft.seats === 1 ? '' : 's';

        // Update preview time values
        const previewDepart = document.getElementById('previewDepartTime');
        const previewArrive = document.getElementById('previewArriveTime');
        if (previewDepart) previewDepart.textContent = formatTime12h(postDraft.departTime);
        if (previewArrive) previewArrive.textContent = formatTime12h(postDraft.arriveTime);

        // Update preview address details
        const previewPickupAddr = document.getElementById('previewPickupAddress');
        const previewDropAddr = document.getElementById('previewDropAddress');
        if (previewPickupAddr) {
            const pa = postDraft.pickupAddress;
            const parts = [pa.street, pa.area, pa.pincode].filter(Boolean);
            previewPickupAddr.textContent = parts.length > 0 ? parts.join(', ') : postDraft.pickup;
        }
        if (previewDropAddr) {
            const da = postDraft.destAddress;
            const parts = [da.street, da.area, da.pincode].filter(Boolean);
            previewDropAddr.textContent = parts.length > 0 ? parts.join(', ') : postDraft.destination;
        }

        // Update vehicle badge based on type
        const isBike = postDraft.vehicleType === 'bike';

        if (previewVehicleBadge) {
            previewVehicleBadge.className = `mode-icon-badge ${isBike ? 'bike' : 'car'}`;
            previewVehicleBadge.innerHTML = isBike ? `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3.2-6H6m12 6.5l-2-7h-3l1 7" />
                </svg>
                <span id="previewVehicleLabel">Bike Ride</span>
            ` : `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="8" width="18" height="10" rx="2" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                    <path d="M5 8l2-4h10l2 4" />
                </svg>
                <span id="previewVehicleLabel">Car Ride</span>
            `;
        }
    }

    function publishPost() {
        // Handled by api.js
    }

    function createPostCardElement(postData) {
        const isBike = postData.vehicleType === 'bike';
        const pickupAddr = (() => {
            const pa = postData.pickupAddress || {};
            const parts = [pa.street, pa.area, pa.pincode].filter(Boolean);
            return parts.length > 0 ? parts.join(', ') : postData.pickup;
        })();
        const destAddr = (() => {
            const da = postData.destAddress || {};
            const parts = [da.street, da.area, da.pincode].filter(Boolean);
            return parts.length > 0 ? parts.join(', ') : postData.destination;
        })();

        const maxSeats = postData.vehicleType === 'bike' ? 1 : 3;
        const el = document.createElement('article');
        el.className = 'post-card';
        el.setAttribute('data-animate', 'pop-in');
        el.setAttribute('data-post-id', postData.id);
        el.setAttribute('data-vehicle-type', postData.vehicleType || 'car');
        const isOwner = postData.createdBy === CURRENT_USER_ID;
        const menuHTML = isOwner ? `
            <div class="post-menu">
                <button class="post-menu-trigger" aria-label="Post options">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
                <div class="post-menu-dropdown">
                    <button class="post-menu-item" data-action="edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Post
                    </button>
                    <button class="post-menu-item danger" data-action="delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete Post
                    </button>
                </div>
            </div>
        ` : '';

        el.innerHTML = `
            <div class="glass-overlay"></div>
            ${!isOwner ? `
            <button class="post-follow-btn" data-creator-id="yogiraj-kulkarni" data-creator-name="Yogiraj Kulkarni" aria-label="Follow Yogiraj Kulkarni">
                <svg class="bell-outline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <svg class="bell-filled" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke-width="2" />
                </svg>
            </button>
            ` : ''}
            <header class="post-header">
                <div class="avatar-container">
                    <div class="avatar">YK</div>
                </div>
                <div class="user-info">
                    <span class="user-name">Yogiraj Kulkarni</span>
                </div>
                ${!isOwner ? `
                <button class="post-dm-btn" data-chat-id="yogiraj" aria-label="Message Yogiraj Kulkarni">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
                ` : ''}
                ${menuHTML}
            </header>
            <div class="route-strip">
                <div class="route-collapsed">
                    <div class="route-label">
                        <span class="route-from">${escapeHtml(postData.pickup)}</span>
                        <span class="route-dot">ΓÇó</span>
                        <span class="route-to">${escapeHtml(postData.destination)}</span>
                    </div>
                    <button class="route-address-btn" aria-label="Toggle address">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Address</span>
                    </button>
                </div>
                <div class="route-address-details">
                    <div class="address-row pickup">
                        <span class="address-label">Pickup:</span>
                        <span class="address-value">${escapeHtml(pickupAddr)}</span>
                    </div>
                    <div class="address-row drop">
                        <span class="address-label">Drop:</span>
                        <span class="address-value">${escapeHtml(destAddr)}</span>
                    </div>
                </div>
            </div>
            <div class="time-strip">
                <div class="time-point departure">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span class="time-label">Departs</span>
                    <span class="time-value">${formatTime12h(postData.departTime)}</span>
                </div>
                <div class="time-connector"></div>
                <div class="time-point arrival">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span class="time-label">Arrives</span>
                    <span class="time-value">${formatTime12h(postData.arriveTime)}</span>
                </div>
            </div>
            <div class="transport-section single-mode">
                <div class="mode-display">
                    <div class="mode-icon-badge ${isBike ? 'bike' : 'car'}">
                        ${isBike ? `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="5.5" cy="17.5" r="3.5" />
                                <circle cx="18.5" cy="17.5" r="3.5" />
                                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3.2-6H6m12 6.5l-2-7h-3l1 7" />
                            </svg>
                            <span>Bike Ride</span>
                        ` : `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="8" width="18" height="10" rx="2" />
                                <circle cx="7" cy="18" r="2" />
                                <circle cx="17" cy="18" r="2" />
                                <path d="M5 8l2-4h10l2 4" />
                            </svg>
                            <span>Car Ride</span>
                        `}
                    </div>
                </div>
                <div class="transport-footer">
                    <div class="price-badge">
                        <span class="currency">Γé╣</span>
                        <span class="amount">${postData.price}</span>
                    </div>
                    <div class="seat-status" data-max-seats="${maxSeats}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        <span class="seat-status-text">Seats Remaining: ${maxSeats} / ${maxSeats}</span>
                    </div>
                    <div class="register-wrapper">
                        <div class="register-line"></div>
                        <button class="register-btn">
                            <span class="btn-text register-text">Register</span>
                            <span class="btn-text registered-text">Registered</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        return el;
    }

    function initPostCardInteractions(postCard) {
        // Register button
        const wrapper = postCard.querySelector('.register-wrapper');
        if (wrapper) {
            const button = wrapper.querySelector('.register-btn');
            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (wrapper.classList.contains('registering') || wrapper.classList.contains('deregistering')) return;
                const isRegistered = wrapper.classList.contains('registered');
                if (isRegistered) {
                    wrapper.classList.add('deregistering');
                    wrapper.classList.remove('registered');
                    // Remove from localStorage
                    const pId = postCard.getAttribute('data-post-id');
                    if (pId) removeBookedRide(pId);
                    // Update seat status UI
                    updateSeatStatusUI(postCard);
                    setTimeout(() => wrapper.classList.remove('deregistering'), 400);
                } else {
                    // Check seat availability
                    const pId = postCard.getAttribute('data-post-id');
                    const vType = postCard.getAttribute('data-vehicle-type') || 'car';
                    const seatInfo = getSeatInfo(pId, vType);
                    if (seatInfo.isFull) return;
                    openRideModal(postCard, wrapper);
                }
            });
        }

        // Post menu (three-dot)
        const menuTrigger = postCard.querySelector('.post-menu-trigger');
        const menuDropdown = postCard.querySelector('.post-menu-dropdown');
        if (menuTrigger && menuDropdown) {
            menuTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // Close any other open menus
                document.querySelectorAll('.post-menu-dropdown.open').forEach(dd => {
                    if (dd !== menuDropdown) dd.classList.remove('open');
                });
                menuDropdown.classList.toggle('open');
            });

            // Menu item actions
            menuDropdown.querySelectorAll('.post-menu-item').forEach(item => {
                item.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    menuDropdown.classList.remove('open');
                    const action = this.getAttribute('data-action');
                    const postId = postCard.getAttribute('data-post-id');
                    if (action === 'delete') {
                        showDeleteConfirmation(postId, postCard);
                    } else if (action === 'edit') {
                        editPost(postId);
                    }
                });
            });
        }

        // Card click animation
        postCard.addEventListener('click', function (e) {
            if (e.target.closest('.register-btn') || e.target.closest('.post-menu') || e.target.closest('.post-dm-btn') || e.target.closest('.post-follow-btn')) return;
            const movingVehicle = this.querySelector('.moving-vehicle:not(.hidden)');
            if (movingVehicle && !this.classList.contains('activated')) {
                this.classList.add('activated');
                movingVehicle.classList.remove('paused');
                movingVehicle.classList.add('animating');
                setTimeout(() => {
                    movingVehicle.classList.remove('animating');
                    movingVehicle.classList.add('paused');
                    this.classList.remove('activated');
                }, 2000);
            }
        });

        // Follow bell button
        const followBtn = postCard.querySelector('.post-follow-btn');
        if (followBtn) {
            const creatorId = followBtn.getAttribute('data-creator-id');
            const followedList = getFollowedCreators();
            if (followedList.includes(creatorId)) {
                followBtn.classList.add('active');
            }
            followBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleFollowCreator(creatorId, this);
            });
        }

        // Initial seat status
        updateSeatStatusUI(postCard);
    }

    // ============================================
    // Post Management ΓÇö Delete & Edit
    // ============================================
    function showDeleteConfirmation(postId, postCard) {
        // Remove any existing modal
        const existing = document.getElementById('deleteConfirmModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'deleteConfirmModal';
        modal.className = 'delete-confirm-overlay';
        modal.innerHTML = `
            <div class="delete-confirm-modal">
                <div class="delete-confirm-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </div>
                <h3 class="delete-confirm-title">Delete this ride?</h3>
                <p class="delete-confirm-desc">This action cannot be undone. The ride post will be permanently removed.</p>
                <div class="delete-confirm-actions">
                    <button class="delete-confirm-btn cancel" id="deleteCancel">Cancel</button>
                    <button class="delete-confirm-btn confirm" id="deleteConfirm">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => modal.classList.add('visible'));

        const closeModal = () => {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 250);
        };

        modal.querySelector('#deleteCancel').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        modal.querySelector('#deleteConfirm').addEventListener('click', () => {
            deletePost(postId, postCard);
            closeModal();
        });
    }

    function deletePost(postId, postCard) {
        // Remove from localStorage
        const savedPosts = JSON.parse(localStorage.getItem('travel_posts') || '[]');
        const filtered = savedPosts.filter(p => String(p.id) !== String(postId));
        localStorage.setItem('travel_posts', JSON.stringify(filtered));

        // Also remove from booked rides and passengers
        removeBookedRide(postId);

        // Animate card removal
        if (postCard) {
            postCard.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            postCard.style.transform = 'scale(0.9)';
            postCard.style.opacity = '0';
            setTimeout(() => postCard.remove(), 400);
        }
    }

    function editPost(postId) {
        const savedPosts = JSON.parse(localStorage.getItem('travel_posts') || '[]');
        const postData = savedPosts.find(p => String(p.id) === String(postId));
        if (!postData) return;

        // Set editing mode
        editingPostId = postData.id;

        // Populate draft
        postDraft.pickup = postData.pickup || '';
        postDraft.destination = postData.destination || '';
        postDraft.vehicleType = postData.vehicleType || 'bike';
        postDraft.price = postData.price || 0;
        postDraft.seats = postData.seats || 1;
        postDraft.departTime = postData.departTime || '';
        postDraft.arriveTime = postData.arriveTime || '';
        postDraft.pickupAddress = postData.pickupAddress || { street: '', area: '', pincode: '' };
        postDraft.destAddress = postData.destAddress || { street: '', area: '', pincode: '' };

        // Populate form inputs
        const pickupInput = document.getElementById('postPickup');
        const destinationInput = document.getElementById('postDestination');
        const priceInput = document.getElementById('postPrice');
        const seatsInput = document.getElementById('postSeats');
        const departTimeInput = document.getElementById('postDepartTime');
        const arriveTimeInput = document.getElementById('postArriveTime');

        if (pickupInput) pickupInput.value = postDraft.pickup;
        if (destinationInput) destinationInput.value = postDraft.destination;
        if (priceInput) priceInput.value = postDraft.price;
        if (seatsInput) seatsInput.value = postDraft.seats;
        if (departTimeInput) departTimeInput.value = postDraft.departTime;
        if (arriveTimeInput) arriveTimeInput.value = postDraft.arriveTime;

        // Set vehicle type
        document.querySelectorAll('.vehicle-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.vehicle === postDraft.vehicleType) opt.classList.add('active');
        });

        // Populate address sub-fields
        const setAddr = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setAddr('pickupStreet', postDraft.pickupAddress.street);
        setAddr('pickupArea', postDraft.pickupAddress.area);
        setAddr('pickupPincode', postDraft.pickupAddress.pincode);
        setAddr('destStreet', postDraft.destAddress.street);
        setAddr('destArea', postDraft.destAddress.area);
        setAddr('destPincode', postDraft.destAddress.pincode);

        // Ensure create step is active
        const stepCreate = document.getElementById('postStepCreate');
        const stepPreview = document.getElementById('postStepPreview');
        if (stepCreate) stepCreate.classList.add('active');
        if (stepPreview) stepPreview.classList.remove('active');

        // Navigate to Post page
        const postBtn = document.querySelector('.sidebar-nav-item[data-tab="post"]');
        if (postBtn) postBtn.click();
    }

    // Close post menus on outside click
    document.addEventListener('click', function () {
        document.querySelectorAll('.post-menu-dropdown.open').forEach(dd => {
            dd.classList.remove('open');
        });
    });

    function loadSavedPosts() {
        const savedPosts = JSON.parse(localStorage.getItem('travel_posts') || '[]');
        if (savedPosts.length === 0) return;

        const feedScroll = document.querySelector('#page-home .feed-scroll');
        if (!feedScroll) return;

        // Get reference to first existing static card
        const firstStaticCard = feedScroll.querySelector('.post-card');

        savedPosts.forEach((postData, index) => {
            const card = createPostCardElement(postData);
            if (firstStaticCard) {
                feedScroll.insertBefore(card, firstStaticCard);
            } else {
                feedScroll.appendChild(card);
            }
            initPostCardInteractions(card);

            // Animate with stagger
            setTimeout(() => {
                card.classList.add('visible');
                card.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
            }, index * CONFIG.staggerDelay);
        });
    }

    // ============================================
    // Booked Rides ΓÇö localStorage helpers
    // ============================================
    function getRawBookedRides() {
        const raw = JSON.parse(localStorage.getItem('booked_rides') || '[]');
        // Backwards compat: migrate old string IDs to objects
        return raw.map(item => {
            if (typeof item === 'string') {
                return { postId: item, status: 'active', from: '', to: '', driverName: '', departTime: '', arriveTime: '', date: '' };
            }
            return item;
        });
    }

    function getBookedRides() {
        // Return only postId strings for active rides (for backwards compat with rendering)
        return getRawBookedRides().filter(r => r.status === 'active').map(r => r.postId);
    }

    function saveBookedRides(arr) {
        localStorage.setItem('booked_rides', JSON.stringify(arr));
    }

    function addBookedRide(postId) {
        const rides = getRawBookedRides();
        if (rides.some(r => r.postId === String(postId))) return;

        // Extract ride data from the post card
        let from = '', to = '', driverName = '', departTime = '', arriveTime = '', vehicleType = 'car';
        const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
        if (postCard) {
            from = postCard.querySelector('.route-from')?.textContent || '';
            to = postCard.querySelector('.route-to')?.textContent || '';
            driverName = postCard.querySelector('.user-name')?.textContent || '';
            vehicleType = postCard.getAttribute('data-vehicle-type') || 'car';
            const timeValues = postCard.querySelectorAll('.time-value');
            departTime = timeValues[0]?.textContent || '';
            arriveTime = timeValues[1]?.textContent || '';
        } else {
            // Try from saved posts (user-created)
            const savedPosts = JSON.parse(localStorage.getItem('travel_posts') || '[]');
            const postData = savedPosts.find(p => String(p.id) === String(postId));
            if (postData) {
                from = postData.pickup || '';
                to = postData.destination || '';
                driverName = 'Yogiraj Kulkarni';
                departTime = postData.departTime || '';
                arriveTime = postData.arriveTime || '';
                vehicleType = postData.vehicleType || 'car';
            }
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        rides.push({
            postId: String(postId),
            status: 'active',
            from,
            to,
            driverName,
            departTime,
            arriveTime,
            vehicleType,
            date: dateStr
        });
        saveBookedRides(rides);

        const passengers = JSON.parse(localStorage.getItem('ride_passengers') || '{}');
        if (!passengers[postId]) passengers[postId] = [];
        if (!passengers[postId].includes(CURRENT_USER_ID)) {
            passengers[postId].push(CURRENT_USER_ID);
        }
        localStorage.setItem('ride_passengers', JSON.stringify(passengers));
    }

    function removeBookedRide(postId) {
        const rides = getRawBookedRides().filter(r => r.postId !== String(postId));
        saveBookedRides(rides);
        const passengers = JSON.parse(localStorage.getItem('ride_passengers') || '{}');
        if (passengers[postId]) {
            passengers[postId] = passengers[postId].filter(u => u !== CURRENT_USER_ID);
            if (passengers[postId].length === 0) delete passengers[postId];
        }
        localStorage.setItem('ride_passengers', JSON.stringify(passengers));
    }

    function isRideBooked(postId) {
        return getBookedRides().includes(String(postId));
    }

    // ============================================
    // Completed Rides ΓÇö localStorage helpers
    // ============================================

    // Clear any stale history data on fresh load
    localStorage.removeItem('completed_rides');

    function getCompletedRides() {
        return JSON.parse(localStorage.getItem('completed_rides') || '[]');
    }

    function addCompletedRide(rideData) {
        const completed = getCompletedRides();
        completed.unshift(rideData);
        localStorage.setItem('completed_rides', JSON.stringify(completed));
    }

    // ============================================
    // Ride Rating Modal
    // ============================================
    function showRatingModal(postId, onSubmit) {
        // Remove any existing modal
        const existing = document.getElementById('rideRatingModal');
        if (existing) existing.remove();

        let selectedRating = 0;

        const overlay = document.createElement('div');
        overlay.id = 'rideRatingModal';
        overlay.className = 'rating-overlay';

        const starSVG = (filled) => filled
            ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

        overlay.innerHTML = `
            <div class="rating-modal">
                <div class="rating-modal-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
                <h3 class="rating-modal-title">Rate your ride experience</h3>
                <div class="rating-stars" id="ratingStarsContainer">
                    ${[1, 2, 3, 4, 5].map(i => `<button class="rating-star" data-value="${i}">${starSVG(false)}</button>`).join('')}
                </div>
                <button class="rating-submit-btn" id="ratingSubmitBtn" disabled>Submit Rating</button>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const starsContainer = overlay.querySelector('#ratingStarsContainer');
        const submitBtn = overlay.querySelector('#ratingSubmitBtn');
        const stars = starsContainer.querySelectorAll('.rating-star');

        function updateStars(hoverVal, activeVal) {
            stars.forEach((star, idx) => {
                const val = idx + 1;
                star.classList.remove('active', 'hover-preview');
                if (val <= activeVal) {
                    star.classList.add('active');
                    star.innerHTML = starSVG(true);
                } else if (val <= hoverVal) {
                    star.classList.add('hover-preview');
                    star.innerHTML = starSVG(true);
                } else {
                    star.innerHTML = starSVG(false);
                }
            });
        }

        stars.forEach((star) => {
            star.addEventListener('mouseenter', function () {
                const val = parseInt(this.dataset.value);
                updateStars(val, selectedRating);
            });

            star.addEventListener('mouseleave', function () {
                updateStars(0, selectedRating);
            });

            star.addEventListener('click', function () {
                selectedRating = parseInt(this.dataset.value);
                updateStars(0, selectedRating);
                submitBtn.disabled = false;
                submitBtn.classList.add('ready');
            });
        });

        submitBtn.addEventListener('click', function () {
            if (selectedRating < 1) return;
            // Close modal
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
            // Callback with rating
            if (onSubmit) onSubmit(selectedRating);
        });
    }

    function completeRide(postId, rating) {
        const rides = getRawBookedRides();
        const rideIndex = rides.findIndex(r => r.postId === String(postId) && r.status === 'active');
        if (rideIndex === -1) return;

        const ride = rides[rideIndex];
        ride.status = 'completed';
        ride.ride_rating = rating || 0;
        saveBookedRides(rides);

        // Store in completed rides for history
        const now = new Date();
        addCompletedRide({
            postId: ride.postId,
            from: ride.from,
            to: ride.to,
            driverName: ride.driverName,
            departTime: ride.departTime,
            arriveTime: ride.arriveTime,
            date: ride.date || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            completedAt: now.toISOString(),
            status: 'completed',
            ride_rating: rating || 0
        });

        // Remove passenger entry
        const passengers = JSON.parse(localStorage.getItem('ride_passengers') || '{}');
        if (passengers[postId]) {
            passengers[postId] = passengers[postId].filter(u => u !== CURRENT_USER_ID);
            if (passengers[postId].length === 0) delete passengers[postId];
        }
        localStorage.setItem('ride_passengers', JSON.stringify(passengers));
    }

    // ============================================
    // Seat Management ΓÇö Helpers
    // ============================================
    function getSeatInfo(postId, vehicleType) {
        const maxSeats = vehicleType === 'bike' ? 1 : 3;
        const passengers = JSON.parse(localStorage.getItem('ride_passengers') || '{}');
        const ridePassengers = passengers[postId] || [];
        const available = Math.max(0, maxSeats - ridePassengers.length);
        return {
            maxSeats,
            passengers: ridePassengers,
            available,
            isFull: available === 0
        };
    }

    function updateSeatStatusUI(postCard) {
        if (!postCard) return;
        const postId = postCard.getAttribute('data-post-id');
        const vehicleType = postCard.getAttribute('data-vehicle-type');
        if (!postId || !vehicleType) return;

        const seatStatusEl = postCard.querySelector('.seat-status');
        const seatTextEl = postCard.querySelector('.seat-status-text');
        const registerBtn = postCard.querySelector('.register-btn');
        const wrapper = postCard.querySelector('.register-wrapper');
        if (!seatStatusEl || !seatTextEl) return;

        const info = getSeatInfo(postId, vehicleType);

        // Remove previous state classes
        seatStatusEl.classList.remove('seat-occupied', 'ride-full');
        if (wrapper) wrapper.classList.remove('seat-full');

        if (info.isFull) {
            if (vehicleType === 'bike') {
                seatTextEl.textContent = `Seats Remaining: 0 / ${info.maxSeats}`;
                seatStatusEl.classList.add('seat-occupied');
            } else {
                seatTextEl.textContent = `Seats Remaining: 0 / ${info.maxSeats}`;
                seatStatusEl.classList.add('ride-full');
            }
            // Disable register button if user is NOT already registered
            if (registerBtn && wrapper && !wrapper.classList.contains('registered')) {
                registerBtn.disabled = true;
                if (wrapper) wrapper.classList.add('seat-full');
            }
        } else {
            seatTextEl.textContent = `Seats Remaining: ${info.available} / ${info.maxSeats}`;
            if (registerBtn) registerBtn.disabled = false;
        }
    }

    // ============================================
    // Booked Rides ΓÇö Render Page
    // ============================================
    function renderBookedRides() {
        // Handled by api.js
    }

    // ============================================
    // Completed Rides ΓÇö History Rendering
    // ============================================
    function renderCompletedHistory() {
        const historyList = document.querySelector('#page-history .history-list');
        const emptyState = document.getElementById('historyEmptyState');
        const countEl = document.querySelector('#page-history .history-count');
        if (!historyList) return;

        // Clear all existing history cards
        historyList.innerHTML = '';

        const completedRides = getCompletedRides().filter(r => r.status === 'completed');

        if (completedRides.length === 0) {
            // Show empty state, hide list
            if (emptyState) emptyState.style.display = '';
            if (countEl) countEl.textContent = '0 rides';
            return;
        }

        // Hide empty state, show rides
        if (emptyState) emptyState.style.display = 'none';
        if (countEl) countEl.textContent = `${completedRides.length} ride${completedRides.length !== 1 ? 's' : ''}`;

        // Render completed rides
        completedRides.forEach(ride => {
            const card = document.createElement('div');
            card.className = 'history-card dynamic-completed';
            card.setAttribute('data-ride-id', `completed-${ride.postId}`);

            const timeRange = ride.departTime && ride.arriveTime
                ? `${ride.departTime} \u2013 ${ride.arriveTime}`
                : ride.departTime || 'N/A';

            card.innerHTML = `
                <div class="history-card-collapsed">
                    <div class="history-date">
                        <span class="history-date-day">${escapeHtml(ride.date || '')}</span>
                        <span class="history-date-time">${escapeHtml(timeRange)}</span>
                    </div>
                    <div class="history-route-strip">
                        <div class="route-point start">
                            <svg class="start-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                            </svg>
                            <span>${escapeHtml(ride.from || 'Unknown')}</span>
                        </div>
                        <div class="route-track">
                            <div class="track-line"></div>
                        </div>
                        <div class="route-point end">
                            <svg class="end-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" fill="currentColor" />
                            </svg>
                            <span>${escapeHtml(ride.to || 'Unknown')}</span>
                        </div>
                    </div>
                    <div class="history-meta">
                        <span class="history-driver-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            ${escapeHtml(ride.driverName || 'Driver')}
                        </span>
                        <span class="history-status-badge completed">Completed</span>
                    </div>
                    ${ride.ride_rating ? `<div class="history-rating">
                        <span class="history-rating-label">Rating:</span>
                        <span class="history-rating-stars">
                            ${[1, 2, 3, 4, 5].map(i => i <= ride.ride_rating
                ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                : '<svg class="empty-star" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            ).join('')}
                        </span>
                        <span class="history-rating-value">(${ride.ride_rating}/5)</span>
                    </div>` : ''}
                    <div class="history-expand-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
                <div class="history-card-expanded">
                    <div class="history-detail-section">
                        <h4 class="detail-section-title">Driver</h4>
                        <div class="driver-info-row">
                            <span class="driver-label">Name</span>
                            <span class="driver-value">${escapeHtml(ride.driverName || 'N/A')}</span>
                        </div>
                    </div>
                    <div class="history-detail-section">
                        <h4 class="detail-section-title">Ride Metrics</h4>
                        <div class="metrics-row">
                            <div class="metric">
                                <span class="metric-value status-completed">Completed</span>
                                <span class="metric-label">Status</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Wire up expand/collapse
            card.addEventListener('click', function (e) {
                if (e.target.closest('.safety-btn')) return;
                const expandedEl = card.querySelector('.history-card-expanded');
                const isExpanded = card.classList.contains('expanded');

                // Collapse other expanded cards
                document.querySelectorAll('#page-history .history-card.expanded').forEach(c => {
                    if (c !== card) {
                        const otherExp = c.querySelector('.history-card-expanded');
                        if (otherExp) springAnimateCollapse(otherExp, c);
                    }
                });

                if (isExpanded) {
                    springAnimateCollapse(expandedEl, card);
                } else {
                    springAnimateExpand(expandedEl, card);
                }
            });

            historyList.appendChild(card);
        });
    }

    // Sync registration state on page load
    function syncRegistrationState() {
        const bookedIds = getBookedRides();
        const allCards = document.querySelectorAll('#page-home .post-card[data-post-id]');
        allCards.forEach(card => {
            const postId = card.getAttribute('data-post-id');
            if (bookedIds.includes(String(postId))) {
                const wrapper = card.querySelector('.register-wrapper');
                if (wrapper && !wrapper.classList.contains('registered')) {
                    wrapper.classList.add('registered');
                }
            }
            // Always sync seat status for every card
            updateSeatStatusUI(card);
        });
    }

    function resetPostForm() {
        const pickupInput = document.getElementById('postPickup');
        const destinationInput = document.getElementById('postDestination');
        const priceInput = document.getElementById('postPrice');
        const vehicleOptions = document.querySelectorAll('.vehicle-option');
        const departTimeInput = document.getElementById('postDepartTime');
        const arriveTimeInput = document.getElementById('postArriveTime');

        const seatsInput = document.getElementById('postSeats');
        if (pickupInput) pickupInput.value = '';
        if (destinationInput) destinationInput.value = '';
        if (priceInput) priceInput.value = '';
        if (seatsInput) seatsInput.value = '';
        if (departTimeInput) departTimeInput.value = '';
        if (arriveTimeInput) arriveTimeInput.value = '';

        // Reset vehicle to bike
        vehicleOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.vehicle === 'bike') opt.classList.add('active');
        });

        // Reset steps
        const stepCreate = document.getElementById('postStepCreate');
        const stepPreview = document.getElementById('postStepPreview');
        if (stepCreate) stepCreate.classList.add('active');
        if (stepPreview) stepPreview.classList.remove('active');

        // Reset draft
        postDraft = {
            pickup: '', destination: '', vehicleType: 'bike', price: 0, seats: 1,
            departTime: '', arriveTime: '',
            pickupAddress: { street: '', area: '', pincode: '' },
            destAddress: { street: '', area: '', pincode: '' }
        };

        // Clear address sub-fields and collapse
        ['pickupStreet', 'pickupArea', 'pickupPincode', 'destStreet', 'destArea', 'destPincode'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.querySelectorAll('.post-address-fields.expanded').forEach(el => {
            el.classList.remove('expanded');
            el.style.height = '0';
        });
        document.querySelectorAll('.post-address-toggle.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    function navigateToHome() {
        // Find and click the home nav button
        const homeBtn = document.querySelector('.sidebar-nav-item[data-tab="home"]');
        if (homeBtn) homeBtn.click();
    }

    // ============================================
    // History Cards - Spring Expand/Collapse
    // ============================================

    // Generate spring keyframes for height animation
    function generateSpringKeyframes(from, to, opts) {
        const { stiffness = 260, damping = 24, mass = 1, steps = 60, duration = 440 } = opts || {};
        const keyframes = [];
        const dt = duration / steps / 1000; // time step in seconds
        let pos = from;
        let vel = 0;
        const target = to;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            // Spring physics
            const displacement = pos - target;
            const springForce = -stiffness * displacement;
            const dampingForce = -damping * vel;
            const acceleration = (springForce + dampingForce) / mass;
            vel += acceleration * dt;
            pos += vel * dt;

            // Clamp overshoot to max 5px
            if (to > from) {
                pos = Math.min(pos, to + 5);
            } else {
                pos = Math.max(pos, to - 5);
            }

            keyframes.push({
                height: `${Math.max(0, pos)}px`,
                offset: progress,
            });
        }

        // Ensure final frame is exact
        keyframes[keyframes.length - 1].height = `${to}px`;
        return keyframes;
    }

    function springAnimateExpand(expandedEl, card) {
        // Measure target height
        expandedEl.style.height = 'auto';
        expandedEl.style.opacity = '1';
        expandedEl.style.padding = '0 16px 16px 16px';
        const targetHeight = expandedEl.scrollHeight;
        expandedEl.style.height = '0px';
        expandedEl.style.opacity = '0';
        expandedEl.style.padding = '0 16px';

        // Force reflow
        expandedEl.offsetHeight;

        const keyframes = generateSpringKeyframes(0, targetHeight, {
            stiffness: 260,
            damping: 22,
            mass: 1,
            steps: 60,
            duration: 440,
        });

        // Add opacity to keyframes
        keyframes.forEach((kf, i) => {
            kf.opacity = i < 5 ? (i / 5) : 1;
            kf.padding = '0 16px 16px 16px';
        });

        card.classList.add('expanded');

        const anim = expandedEl.animate(keyframes, {
            duration: 440,
            easing: 'linear', // spring physics are baked into keyframes
            fill: 'forwards',
        });

        anim.onfinish = () => {
            expandedEl.style.height = 'auto';
            expandedEl.style.opacity = '1';
            expandedEl.style.padding = '0 16px 16px 16px';
            anim.cancel();
        };
    }

    function springAnimateCollapse(expandedEl, card) {
        const currentHeight = expandedEl.scrollHeight;

        const keyframes = generateSpringKeyframes(currentHeight, 0, {
            stiffness: 260,
            damping: 26, // tighter for collapse
            mass: 1,
            steps: 50,
            duration: 400,
        });

        // Add opacity to keyframes
        keyframes.forEach((kf, i, arr) => {
            const progress = i / (arr.length - 1);
            kf.opacity = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
            kf.padding = progress > 0.9 ? '0 16px' : '0 16px 16px 16px';
        });

        const anim = expandedEl.animate(keyframes, {
            duration: 400,
            easing: 'linear',
            fill: 'forwards',
        });

        anim.onfinish = () => {
            card.classList.remove('expanded');
            expandedEl.style.height = '0';
            expandedEl.style.opacity = '0';
            expandedEl.style.padding = '0 16px';
            anim.cancel();
        };
    }

    function initHistoryCards() {
        const historyCards = document.querySelectorAll('.history-card');
        if (!historyCards.length) return;

        let animating = false;

        historyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent toggle when clicking safety buttons
                if (e.target.closest('.safety-btn')) return;
                if (animating) return;

                animating = true;
                const expandedEl = card.querySelector('.history-card-expanded');
                const isExpanded = card.classList.contains('expanded');

                // Collapse any other expanded card first
                const promises = [];
                historyCards.forEach(c => {
                    if (c !== card && c.classList.contains('expanded')) {
                        const otherExpanded = c.querySelector('.history-card-expanded');
                        const p = new Promise(resolve => {
                            const currentHeight = otherExpanded.scrollHeight;
                            const kf = generateSpringKeyframes(currentHeight, 0, {
                                stiffness: 260, damping: 26, mass: 1, steps: 50, duration: 400,
                            });
                            kf.forEach((k, i, arr) => {
                                const prog = i / (arr.length - 1);
                                k.opacity = prog > 0.7 ? 1 - ((prog - 0.7) / 0.3) : 1;
                                k.padding = prog > 0.9 ? '0 16px' : '0 16px 16px 16px';
                            });
                            const a = otherExpanded.animate(kf, { duration: 400, easing: 'linear', fill: 'forwards' });
                            a.onfinish = () => {
                                c.classList.remove('expanded');
                                otherExpanded.style.height = '0';
                                otherExpanded.style.opacity = '0';
                                otherExpanded.style.padding = '0 16px';
                                a.cancel();
                                resolve();
                            };
                        });
                        promises.push(p);
                    }
                });

                // After collapsing others, expand or collapse clicked card
                Promise.all(promises).then(() => {
                    if (isExpanded) {
                        springAnimateCollapse(expandedEl, card);
                        setTimeout(() => { animating = false; }, 410);
                    } else {
                        springAnimateExpand(expandedEl, card);
                        setTimeout(() => { animating = false; }, 450);
                    }
                });

                if (promises.length === 0 && isExpanded) {
                    // If no other cards to collapse, release lock sooner for collapse
                } else if (promises.length === 0) {
                    // No other cards to collapse, lock is released after expand
                }
            });
        });
    }

    // ============================================
    // Initialize
    // ============================================
    function init() {
        addRippleStyles();
        initScrollAnimations();
        initPageNavigation();
        initRouteSearchBar();
        initAddressToggle();
        initPostAddressToggle();
        initRegisterButtons();
        initRideModal();
        initPostCreation();
        initNotificationButton();
        initChatInbox();
        initChatInput();
        initDMButtons();
        initFollowButtons();
        initMenuItems();
        initHistoryCards();
        loadSavedPosts();

        // Sync registration state from localStorage
        syncRegistrationState();

        // Initial card visibility
        setTimeout(() => {
            elements.postCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setTimeout(() => {
                        card.classList.add('visible');
                        card.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
                    }, index * CONFIG.staggerDelay);
                }
            });
        }, 100);

        console.log('Travel Connect UI initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* =========================================================
   Account Settings Panel + Permissions
   Adds Settings sub-view, reusable change-password entrypoint,
   and localStorage-backed app permission toggles.
   ========================================================= */
(function () {
    'use strict';

    const STORAGE_KEY = 'tc_settings_permissions';
    const DEFAULT_PERMISSIONS = {
        notifications: true,
        location: true,
        sounds: true,
    };

    const mainView = document.getElementById('accountMainView');
    const editView = document.getElementById('editProfileView');
    const privacyView = document.getElementById('privacyView');
    const settingsView = document.getElementById('settingsView');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsBackBtn = document.getElementById('settingsBackBtn');
    const changePasswordBtn = document.getElementById('settingsChangePasswordBtn');
    const settingsPasswordBackdrop = document.getElementById('settingsPasswordBackdrop');
    const settingsPasswordCloseBtn = document.getElementById('settingsPasswordCloseBtn');
    const settingsPasswordSteps = {
        email: document.getElementById('settingsPasswordStepEmail'),
        otp: document.getElementById('settingsPasswordStepOtp'),
        confirm: document.getElementById('settingsPasswordStepConfirm'),
    };
    const settingsPasswordInputs = {
        email: document.getElementById('settingsPasswordEmail'),
        otp: document.getElementById('settingsPasswordOtp'),
        password: document.getElementById('settingsPasswordNew'),
        confirmPassword: document.getElementById('settingsPasswordConfirm'),
    };
    const settingsPasswordErrors = {
        email: document.getElementById('settingsPasswordEmailError'),
        otp: document.getElementById('settingsPasswordOtpError'),
        confirm: document.getElementById('settingsPasswordConfirmError'),
    };
    const settingsPasswordButtons = {
        sendOtp: document.getElementById('settingsPasswordSendOtpBtn'),
        verifyOtp: document.getElementById('settingsPasswordVerifyOtpBtn'),
        confirm: document.getElementById('settingsPasswordConfirmBtn'),
    };

    const notificationsToggle = document.getElementById('settingsNotificationsToggle');
    const locationToggle = document.getElementById('settingsLocationToggle');
    const soundsToggle = document.getElementById('settingsSoundsToggle');
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.getElementById('notificationPanel');
    const notificationOverlay = document.getElementById('notificationOverlay');

    if (!mainView || !settingsView || !settingsBtn || !settingsBackBtn) return;

    function loadPermissions() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { ...DEFAULT_PERMISSIONS };
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_PERMISSIONS, ...parsed };
        } catch (err) {
            return { ...DEFAULT_PERMISSIONS };
        }
    }

    function savePermissions(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function showSettingsView() {
        mainView.style.display = 'none';
        if (editView) editView.classList.remove('active');
        if (privacyView) privacyView.classList.remove('active');
        settingsView.classList.add('active');
    }

    function hideSettingsView() {
        settingsView.classList.remove('active');
        mainView.style.display = '';
    }

    function showSettingsPasswordStep(stepKey) {
        Object.keys(settingsPasswordSteps).forEach(function (key) {
            const stepEl = settingsPasswordSteps[key];
            if (!stepEl) return;
            stepEl.classList.toggle('active', key === stepKey);
        });
    }

    function clearSettingsPasswordErrors() {
        Object.values(settingsPasswordErrors).forEach(function (errorEl) {
            if (errorEl) errorEl.textContent = '';
        });
    }

    function resetSettingsPasswordFlow() {
        Object.values(settingsPasswordInputs).forEach(function (inputEl) {
            if (inputEl) inputEl.value = '';
        });
        clearSettingsPasswordErrors();
        showSettingsPasswordStep('email');
    }

    function openSettingsPasswordModal() {
        if (!settingsPasswordBackdrop) return;
        resetSettingsPasswordFlow();
        settingsPasswordBackdrop.classList.add('visible');
    }

    function closeSettingsPasswordModal() {
        if (!settingsPasswordBackdrop) return;
        settingsPasswordBackdrop.classList.remove('visible');
        resetSettingsPasswordFlow();
    }

    function applyPermissions(state) {
        window.__appSettingsPermissions = state;

        if (notificationsToggle) notificationsToggle.checked = !!state.notifications;
        if (locationToggle) locationToggle.checked = !!state.location;
        if (soundsToggle) soundsToggle.checked = !!state.sounds;

        document.body.classList.toggle('notifications-disabled', !state.notifications);
        document.body.dataset.locationAccess = state.location ? 'enabled' : 'disabled';

        if (notificationBtn) {
            notificationBtn.style.display = state.notifications ? '' : 'none';
        }

        if (!state.notifications && notificationPanel && notificationOverlay) {
            notificationPanel.classList.remove('active');
            notificationOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    let permissionsState = loadPermissions();
    applyPermissions(permissionsState);

    function updatePermission(key, value) {
        permissionsState = { ...permissionsState, [key]: value };
        savePermissions(permissionsState);
        applyPermissions(permissionsState);
    }

    settingsBtn.addEventListener('click', showSettingsView);
    settingsBackBtn.addEventListener('click', hideSettingsView);

    if (changePasswordBtn && settingsPasswordBackdrop) {
        changePasswordBtn.addEventListener('click', openSettingsPasswordModal);
    }

    if (settingsPasswordCloseBtn) {
        settingsPasswordCloseBtn.addEventListener('click', closeSettingsPasswordModal);
    }

    if (settingsPasswordBackdrop) {
        settingsPasswordBackdrop.addEventListener('click', function (event) {
            if (event.target === settingsPasswordBackdrop) {
                closeSettingsPasswordModal();
            }
        });
    }

    if (settingsPasswordButtons.sendOtp) {
        settingsPasswordButtons.sendOtp.addEventListener('click', async function () {
            try {
                const token = localStorage.getItem('token');
                let res = await fetch('http://127.0.0.1:5000/api/auth/settings/send-otp', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let data = await res.json();
                if (res.ok) {
                    if (settingsPasswordErrors.email) settingsPasswordErrors.email.textContent = '';
                    showSettingsPasswordStep('otp');
                } else {
                    if (settingsPasswordErrors.email) settingsPasswordErrors.email.textContent = data.message || 'Error sending OTP';
                }
            } catch(err) {
                console.error(err);
                if (settingsPasswordErrors.email) settingsPasswordErrors.email.textContent = 'Network error';
            }
        });
    }

    if (settingsPasswordButtons.verifyOtp) {
        settingsPasswordButtons.verifyOtp.addEventListener('click', async function () {
            const otpValue = settingsPasswordInputs.otp ? settingsPasswordInputs.otp.value.trim() : '';
            if (!otpValue) {
                if (settingsPasswordErrors.otp) settingsPasswordErrors.otp.textContent = 'Please enter OTP';
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                let res = await fetch('http://127.0.0.1:5000/api/auth/settings/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ otp: otpValue })
                });
                let data = await res.json();
                
                if (res.ok) {
                    if (settingsPasswordErrors.otp) settingsPasswordErrors.otp.textContent = '';
                    showSettingsPasswordStep('confirm');
                } else {
                    if (settingsPasswordErrors.otp) settingsPasswordErrors.otp.textContent = data.message || 'Invalid OTP';
                }
            } catch(err) {
                console.error(err);
                if (settingsPasswordErrors.otp) settingsPasswordErrors.otp.textContent = 'Network error';
            }
        });
    }

    if (settingsPasswordButtons.confirm) {
        settingsPasswordButtons.confirm.addEventListener('click', async function () {
            const passwordValue = settingsPasswordInputs.password ? settingsPasswordInputs.password.value : '';
            const confirmValue = settingsPasswordInputs.confirmPassword ? settingsPasswordInputs.confirmPassword.value : '';
            const otpValue = settingsPasswordInputs.otp ? settingsPasswordInputs.otp.value.trim() : '';

            if (!passwordValue || !confirmValue) {
                if (settingsPasswordErrors.confirm) settingsPasswordErrors.confirm.textContent = 'Please fill in both password fields';
                return;
            }
            if (passwordValue !== confirmValue) {
                if (settingsPasswordErrors.confirm) settingsPasswordErrors.confirm.textContent = 'Passwords do not match';
                return;
            }

            try {
                const token = localStorage.getItem('token');
                let res = await fetch('http://127.0.0.1:5000/api/auth/settings/verify-reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ otp: otpValue, new_password: passwordValue })
                });
                let data = await res.json();
                if (res.ok) {
                    if (settingsPasswordErrors.confirm) settingsPasswordErrors.confirm.textContent = '';
                    alert('Password changed successfully. Please login again.');
                    localStorage.removeItem('token');
                    window.location.href = window.location.pathname + '?auth=login';
                } else {
                    if (settingsPasswordErrors.confirm) settingsPasswordErrors.confirm.textContent = data.message || 'Error changing password';
                }
            } catch(err) {
                console.error(err);
                if (settingsPasswordErrors.confirm) settingsPasswordErrors.confirm.textContent = 'Network error';
            }
        });
    }

    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', function () {
            updatePermission('notifications', this.checked);
        });
    }

    if (locationToggle) {
        locationToggle.addEventListener('change', function () {
            updatePermission('location', this.checked);
        });
    }

    if (soundsToggle) {
        soundsToggle.addEventListener('change', function () {
            updatePermission('sounds', this.checked);
        });
    }
})();

// ============================================
// FLOATING CHAT SYSTEM ΓÇö ChatManager
// ============================================
(function () {
    'use strict';

    // ---- State ----
    const state = {
        panelOpen: false,
        activeChats: [],      // [{id, name, initials, online}]
        minimizedChats: [],   // chat IDs that are minimized
        totalUnread: 1,       // only Neha Kulkarni has unread
    };

    // ---- Conversation data (matches main Chat page contacts) ----
    const chatData = {
        arjun: [
            { from: 'them', text: 'Hey! Are we still on for tomorrow\'s ride to BKC?', time: '9:30 AM' },
            { from: 'me', text: 'Yes, absolutely! I\'ll pick you up at 8:30 AM', time: '9:32 AM' },
            { from: 'them', text: 'Perfect! Should I wait at the usual spot near the metro station?', time: '9:33 AM' },
            { from: 'me', text: 'Yes, same place as last time. I\'ll be in the white Honda City', time: '9:35 AM' },
            { from: 'them', text: 'See you at 9 AM tomorrow!', time: '9:42 AM' },
        ],
        priya: [
            { from: 'them', text: 'The ride was really smooth today!', time: '4:30 PM' },
            { from: 'me', text: 'Glad you liked it! Same route tomorrow?', time: '4:32 PM' },
            { from: 'them', text: 'Thanks for the ride today ≡ƒÜù', time: '4:45 PM' },
        ],
        rohan: [
            { from: 'me', text: 'Sure, 8:30 AM works for me.', time: '3:00 PM' },
            { from: 'them', text: 'Actually, can we push it a bit?', time: '3:15 PM' },
            { from: 'them', text: 'Can we reschedule to Thursday?', time: '3:20 PM' },
        ],
        neha: [
            { from: 'them', text: 'Are you leaving from Powai today?', time: '11:00 AM' },
            { from: 'me', text: 'Yes, around 6 PM. Want to join?', time: '11:05 AM' },
            { from: 'them', text: 'I\'ll be waiting at the usual spot', time: '11:10 AM' },
        ],
        vikram: [
            { from: 'them', text: 'That was a really nice drive', time: 'Yesterday' },
            { from: 'me', text: 'Thanks! Happy to carpool anytime', time: 'Yesterday' },
            { from: 'them', text: 'Great driving today!', time: 'Yesterday' },
        ],
        ananya: [
            { from: 'me', text: 'I\'m on my way, about 10 min away', time: '2 days ago' },
            { from: 'them', text: 'Sure, take your time!', time: '2 days ago' },
            { from: 'them', text: 'Let me know when you reach', time: '2 days ago' },
        ],
    };

    // ---- DOM refs ----
    const fcBtn = document.getElementById('fcBtn');
    const fcBadge = document.getElementById('fcBadge');
    const fcPanel = document.getElementById('fcPanel');
    const fcPanelList = document.getElementById('fcPanelList');
    const fcWindows = document.getElementById('fcWindows');

    if (!fcBtn || !fcPanel) return;

    // ---- Floating Button: toggle panel ----
    fcBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.panelOpen) closePanel(); else openPanel();
    });

    function openPanel() {
        state.panelOpen = true;
        fcPanel.classList.add('fc-panel-open');
    }

    function closePanel() {
        state.panelOpen = false;
        fcPanel.classList.remove('fc-panel-open');
    }

    // ---- Close panel on outside click ----
    document.addEventListener('click', (e) => {
        if (!state.panelOpen) return;
        if (e.target.closest('#fcPanel') || e.target.closest('#fcBtn')) return;
        closePanel();
    });

    // ---- Close panel on ESC ----
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (state.panelOpen) closePanel();
        }
    });

    // ---- Chat item click ΓåÆ open window ----
    fcPanelList.addEventListener('click', (e) => {
        const item = e.target.closest('.fc-chat-item');
        if (!item) return;

        const chatId = item.dataset.chatId;
        const name = item.dataset.name;
        const initials = item.dataset.initials;
        const online = item.dataset.online === 'true';

        // Remove unread dot from this item
        const dot = item.querySelector('.fc-unread-dot');
        if (dot) {
            dot.remove();
            state.totalUnread = Math.max(0, state.totalUnread - 1);
            updateBadge();
        }

        // If already open, just focus it (un-minimize if needed)
        const existing = state.activeChats.find(c => c.id === chatId);
        if (existing) {
            const winEl = document.getElementById(`fc-win-${chatId}`);
            if (winEl && winEl.classList.contains('fc-minimized')) {
                restoreWindow(chatId);
            }
            closePanel();
            return;
        }

        // Max 3 windows
        if (state.activeChats.length >= 3) {
            // Remove the oldest
            const oldest = state.activeChats.shift();
            removeChatWindowEl(oldest.id);
        }

        state.activeChats.push({ id: chatId, name, initials, online });
        createChatWindow(chatId, name, initials, online);
        closePanel();
    });

    // ---- Create a chat window ----
    function createChatWindow(chatId, name, initials, online) {
        const win = document.createElement('div');
        win.className = 'fc-window';
        win.id = `fc-win-${chatId}`;

        const onlineDotHTML = online
            ? '<span class="fc-online-dot"></span>'
            : '';

        const messagesHTML = (chatData[chatId] || []).map(msg => `
            <div class="fc-msg ${msg.from === 'me' ? 'fc-msg-sent' : 'fc-msg-received'}">
                ${escapeHTML(msg.text)}
                <span class="fc-msg-time">${msg.time}</span>
            </div>
        `).join('');

        win.innerHTML = `
            <div class="fc-window-header">
                <div class="fc-window-avatar">
                    <span>${initials}</span>
                    ${onlineDotHTML}
                </div>
                <span class="fc-window-name">${escapeHTML(name)}</span>
                <div class="fc-window-actions">
                    <button class="fc-window-action fc-minimize-btn" aria-label="Minimize" data-chat="${chatId}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <button class="fc-window-action fc-close-btn" aria-label="Close" data-chat="${chatId}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="fc-window-body" id="fc-body-${chatId}">
                ${messagesHTML}
            </div>
            <div class="fc-window-input">
                <input class="fc-input-field" type="text" placeholder="MessageΓÇª" id="fc-input-${chatId}" />
                <button class="fc-send-btn" data-chat="${chatId}" aria-label="Send">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        `;

        fcWindows.appendChild(win);

        // Auto-scroll to bottom
        const body = win.querySelector('.fc-window-body');
        requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
        });

        // ---- Event: Minimize ----
        win.querySelector('.fc-minimize-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeWindow(chatId);
        });

        // ---- Event: Close ----
        win.querySelector('.fc-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            closeChatWindow(chatId);
        });

        // ---- Event: Click header to restore when minimized ----
        win.querySelector('.fc-window-header').addEventListener('click', () => {
            if (win.classList.contains('fc-minimized')) {
                restoreWindow(chatId);
            }
        });

        // ---- Event: Send message ----
        const input = win.querySelector('.fc-input-field');
        const sendBtn = win.querySelector('.fc-send-btn');

        sendBtn.addEventListener('click', () => sendChatMessage(chatId));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage(chatId);
            }
        });
    }

    function sendChatMessage(chatId) {
        const input = document.getElementById(`fc-input-${chatId}`);
        const body = document.getElementById(`fc-body-${chatId}`);
        if (!input || !body) return;

        const text = input.value.trim();
        if (!text) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const msgDiv = document.createElement('div');
        msgDiv.className = 'fc-msg fc-msg-sent';
        msgDiv.innerHTML = `${escapeHTML(text)}<span class="fc-msg-time">${timeStr}</span>`;

        body.appendChild(msgDiv);
        input.value = '';

        requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
        });
    }

    function minimizeWindow(chatId) {
        const win = document.getElementById(`fc-win-${chatId}`);
        if (win) {
            win.classList.add('fc-minimized');
            if (!state.minimizedChats.includes(chatId)) {
                state.minimizedChats.push(chatId);
            }
        }
    }

    function restoreWindow(chatId) {
        const win = document.getElementById(`fc-win-${chatId}`);
        if (win) {
            win.classList.remove('fc-minimized');
            state.minimizedChats = state.minimizedChats.filter(id => id !== chatId);
            // Re-scroll to bottom
            const body = win.querySelector('.fc-window-body');
            if (body) {
                requestAnimationFrame(() => {
                    body.scrollTop = body.scrollHeight;
                });
            }
        }
    }

    function closeChatWindow(chatId) {
        const win = document.getElementById(`fc-win-${chatId}`);
        if (win) {
            win.classList.add('fc-closing');
            setTimeout(() => {
                win.remove();
            }, 180);
        }
        state.activeChats = state.activeChats.filter(c => c.id !== chatId);
        state.minimizedChats = state.minimizedChats.filter(id => id !== chatId);
    }

    function removeChatWindowEl(chatId) {
        const win = document.getElementById(`fc-win-${chatId}`);
        if (win) win.remove();
        state.minimizedChats = state.minimizedChats.filter(id => id !== chatId);
    }

    // ---- Badge ----
    function updateBadge() {
        if (state.totalUnread > 0) {
            fcBadge.textContent = state.totalUnread;
            fcBadge.classList.remove('fc-badge-hidden');
        } else {
            fcBadge.classList.add('fc-badge-hidden');
        }
    }

    // ---- Page awareness: hide on Chat page ----
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
        const observer = new MutationObserver(() => {
            const isChatPage = appLayout.classList.contains('chat-grid');
            fcBtn.classList.toggle('fc-hidden', isChatPage);
            if (isChatPage) closePanel();
        });
        observer.observe(appLayout, { attributes: true, attributeFilter: ['class'] });
    }

    // ---- Utility ----
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();

/* =========================================================
   Edit Profile System
   Frontend-only profile editing with accent theme toggle,
   live preview, cover photo, avatar styles, emoji picker,
   density toggle, and animations toggle
   ========================================================= */
(function () {
    'use strict';

    // ΓöÇΓöÇ Defaults ΓöÇΓöÇ
    const DEFAULTS = {
        name: 'Yogiraj Kulkarni',
        bio: 'Exploring the world, one ride at a time ≡ƒîì',
        initials: 'YK',
        accent: 'blue',
        avatarSrc: '',
        coverSrc: '',
        avatarStyle: 'solid',
        density: 'spacious',
        animations: true,
    };

    // ΓöÇΓöÇ Accent color map ΓöÇΓöÇ
    const ACCENT_MAP = {
        blue: { main: 'rgba(100,149,237,0.9)', bg: 'rgba(100,149,237,0.3)', border: 'rgba(100,149,237,0.4)' },
        purple: { main: 'rgba(168,85,247,0.9)', bg: 'rgba(168,85,247,0.3)', border: 'rgba(168,85,247,0.4)' },
        emerald: { main: 'rgba(52,211,153,0.9)', bg: 'rgba(52,211,153,0.3)', border: 'rgba(52,211,153,0.4)' },
        rose: { main: 'rgba(251,113,133,0.9)', bg: 'rgba(251,113,133,0.3)', border: 'rgba(251,113,133,0.4)' },
        amber: { main: 'rgba(251,191,36,0.9)', bg: 'rgba(251,191,36,0.3)', border: 'rgba(251,191,36,0.4)' },
        cyan: { main: 'rgba(34,211,238,0.9)', bg: 'rgba(34,211,238,0.3)', border: 'rgba(34,211,238,0.4)' },
    };

    const BIO_MAX = 150;

    // ΓöÇΓöÇ Session state ΓöÇΓöÇ
    let currentState = { ...DEFAULTS };

    // ΓöÇΓöÇ DOM refs ΓöÇΓöÇ
    const mainView = document.getElementById('accountMainView');
    const editView = document.getElementById('editProfileView');
    const editBtn = document.getElementById('editProfileBtn');
    const backBtn = document.getElementById('editProfileBackBtn');
    const saveBtn = document.getElementById('editSaveBtn');
    const resetBtn = document.getElementById('editResetBtn');
    const nameInput = document.getElementById('editNameInput');
    const bioInput = document.getElementById('editBioInput');
    const charCounter = document.getElementById('bioCharCounter');
    const picInput = document.getElementById('profilePicInput');
    const accentPicker = document.getElementById('accentPicker');

    // Display elements (account page)
    const nameDisplay = document.getElementById('accountNameDisplay');
    const bioDisplay = document.getElementById('accountBioDisplay');
    const avatarDisplay = document.getElementById('accountAvatarDisplay');
    const avatarInitials = document.getElementById('avatarInitials');
    const avatarImgDisp = document.getElementById('avatarImgDisplay');
    const coverDisplay = document.getElementById('accountCoverDisplay');

    // Edit view avatar
    const editAvatarInit = document.getElementById('editAvatarInitials');
    const editAvatarImg = document.getElementById('editAvatarImg');
    const editAvatarCircle = document.getElementById('editAvatarCircle');

    // Cover photo
    const coverInput = document.getElementById('coverPicInput');
    const coverUpload = document.getElementById('editCoverUpload');
    const coverPreview = document.getElementById('editCoverPreview');

    // Avatar style picker
    const avatarStylePicker = document.getElementById('avatarStylePicker');
    const avatarStyleGroup = document.getElementById('avatarStyleGroup');

    // Emoji
    const emojiToggle = document.getElementById('emojiToggleBtn');
    const emojiPanel = document.getElementById('emojiPanel');

    // Density & Animations
    const animToggle = document.getElementById('animToggle');

    // Live preview
    const lpName = document.getElementById('lpName');
    const lpBio = document.getElementById('lpBio');
    const lpInitials = document.getElementById('lpInitials');
    const lpAvatarImg = document.getElementById('lpAvatarImg');
    const lpAvatar = document.getElementById('lpAvatar');
    const lpCover = document.getElementById('lpCover');

    // Post section elements (update on save)
    const postUserAvatar = document.querySelector('.post-user-avatar');
    const postUserName = document.querySelector('.post-user-name');

    if (!mainView || !editView || !editBtn) return;

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // VIEW TOGGLING
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    function showEditView() {
        nameInput.value = currentState.name;
        bioInput.value = currentState.bio;
        updateCharCounter();

        // Sync avatar
        syncAvatarPreview(editAvatarImg, editAvatarInit, editAvatarCircle);
        syncAvatarPreview(lpAvatarImg, lpInitials, lpAvatar);

        // Sync cover preview
        if (currentState.coverSrc) {
            coverPreview.style.backgroundImage = `url(${currentState.coverSrc})`;
            coverPreview.classList.add('has-image');
            lpCover.style.backgroundImage = `url(${currentState.coverSrc})`;
        }

        // Sync accent picker
        accentPicker.querySelectorAll('.accent-swatch').forEach(s => {
            s.classList.toggle('active', s.dataset.accent === currentState.accent);
        });

        // Sync avatar style picker
        if (avatarStylePicker) {
            avatarStylePicker.querySelectorAll('.avatar-style-opt').forEach(o => {
                o.classList.toggle('active', o.dataset.style === currentState.avatarStyle);
            });
            // Hide avatar style group if photo is set
            avatarStyleGroup.style.display = currentState.avatarSrc ? 'none' : '';
        }

        // Sync density
        document.querySelectorAll('.density-opt').forEach(o => {
            o.classList.toggle('active', o.dataset.density === currentState.density);
        });

        // Sync animations toggle
        if (animToggle) animToggle.checked = currentState.animations;

        // Sync live preview
        updateLivePreview();

        mainView.style.display = 'none';
        editView.classList.add('active');
    }

    function showMainView() {
        editView.classList.remove('active');
        mainView.style.display = '';
        // Close emoji panel if open
        if (emojiPanel) emojiPanel.classList.remove('open');
    }

    function syncAvatarPreview(imgEl, initialsEl, containerEl) {
        if (currentState.avatarSrc) {
            imgEl.src = currentState.avatarSrc;
            imgEl.classList.add('visible');
            initialsEl.style.display = 'none';
        } else {
            imgEl.classList.remove('visible');
            initialsEl.style.display = '';
            initialsEl.textContent = currentState.initials;
        }
        // Apply avatar style class
        if (containerEl) {
            containerEl.classList.remove('avatar-gradient', 'avatar-glass');
            if (!currentState.avatarSrc && currentState.avatarStyle !== 'solid') {
                containerEl.classList.add('avatar-' + currentState.avatarStyle);
            }
        }
    }

    editBtn.addEventListener('click', showEditView);
    backBtn.addEventListener('click', showMainView);

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // LIVE PREVIEW - Updates as user types
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    function updateLivePreview() {
        if (lpName) lpName.textContent = nameInput.value || 'Your Name';
        if (lpBio) lpBio.textContent = bioInput.value || 'Your bio will appear here...';

        const initials = (nameInput.value || 'YK').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        if (lpInitials) lpInitials.textContent = initials;

        // Avatar in preview
        if (currentState.avatarSrc) {
            lpAvatarImg.src = currentState.avatarSrc;
            lpAvatarImg.classList.add('visible');
            lpInitials.style.display = 'none';
        } else {
            lpAvatarImg.classList.remove('visible');
            lpInitials.style.display = '';
        }

        // Avatar style in preview
        if (lpAvatar) {
            lpAvatar.classList.remove('avatar-gradient', 'avatar-glass');
            if (!currentState.avatarSrc && currentState.avatarStyle !== 'solid') {
                lpAvatar.classList.add('avatar-' + currentState.avatarStyle);
            }
        }

        // Cover in preview
        if (lpCover) {
            lpCover.style.backgroundImage = currentState.coverSrc ? `url(${currentState.coverSrc})` : '';
        }
    }

    nameInput.addEventListener('input', updateLivePreview);
    bioInput.addEventListener('input', function () {
        updateCharCounter();
        updateLivePreview();
    });

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // BIO CHARACTER COUNTER
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    function updateCharCounter() {
        const len = bioInput.value.length;
        charCounter.textContent = `${len}/${BIO_MAX}`;
        charCounter.classList.remove('near-limit', 'at-limit');
        if (len >= BIO_MAX) {
            charCounter.classList.add('at-limit');
        } else if (len >= BIO_MAX * 0.85) {
            charCounter.classList.add('near-limit');
        }
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // PROFILE PICTURE PREVIEW
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    picInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            currentState.avatarSrc = e.target.result;
            syncAvatarPreview(editAvatarImg, editAvatarInit, editAvatarCircle);
            // Hide avatar style group when photo is set
            if (avatarStyleGroup) avatarStyleGroup.style.display = 'none';
            updateLivePreview();
        };
        reader.readAsDataURL(file);
    });

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // COVER PHOTO UPLOAD
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    if (coverUpload && coverInput) {
        coverUpload.addEventListener('click', function () {
            coverInput.click();
        });

        coverInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                currentState.coverSrc = e.target.result;
                coverPreview.style.backgroundImage = `url(${e.target.result})`;
                coverPreview.classList.add('has-image');
                updateLivePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // AVATAR FALLBACK STYLE PICKER
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    if (avatarStylePicker) {
        avatarStylePicker.addEventListener('click', function (e) {
            const opt = e.target.closest('.avatar-style-opt');
            if (!opt) return;

            const style = opt.dataset.style;
            currentState.avatarStyle = style;

            avatarStylePicker.querySelectorAll('.avatar-style-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            // Apply to edit avatar preview
            editAvatarCircle.classList.remove('avatar-gradient', 'avatar-glass');
            if (style !== 'solid') {
                editAvatarCircle.classList.add('avatar-' + style);
            }

            updateLivePreview();
        });
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // EMOJI PICKER
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    if (emojiToggle && emojiPanel) {
        emojiToggle.addEventListener('click', function () {
            emojiPanel.classList.toggle('open');
        });

        emojiPanel.addEventListener('click', function (e) {
            const item = e.target.closest('.emoji-item');
            if (!item) return;

            const emoji = item.dataset.emoji;
            if (!emoji) return;

            // Insert at cursor position
            const start = bioInput.selectionStart;
            const end = bioInput.selectionEnd;
            const text = bioInput.value;

            if (text.length + emoji.length > BIO_MAX) return;

            bioInput.value = text.substring(0, start) + emoji + text.substring(end);
            bioInput.selectionStart = bioInput.selectionEnd = start + emoji.length;
            bioInput.focus();

            updateCharCounter();
            updateLivePreview();
        });

        // Close emoji panel on outside click
        document.addEventListener('click', function (e) {
            if (!emojiPanel.contains(e.target) && e.target !== emojiToggle && !emojiToggle.contains(e.target)) {
                emojiPanel.classList.remove('open');
            }
        });
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // ACCENT COLOR PICKER
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    accentPicker.addEventListener('click', function (e) {
        const swatch = e.target.closest('.accent-swatch');
        if (!swatch) return;

        const accent = swatch.dataset.accent;
        currentState.accent = accent;

        accentPicker.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        applyAccent(accent);
    });

    function applyAccent(accent) {
        const colors = ACCENT_MAP[accent];
        if (!colors) return;

        document.documentElement.style.setProperty('--color-accent-blue', colors.main);

        // Update avatar borders (only if solid style active and no photo)
        if (currentState.avatarStyle === 'solid') {
            const avatars = document.querySelectorAll('.account-avatar, .edit-avatar-circle');
            avatars.forEach(a => {
                a.style.background = `linear-gradient(135deg, ${colors.bg}, ${colors.bg.replace('0.3', '0.1')})`;
                a.style.borderColor = colors.border;
            });
        }

        // Update sidebar active glow
        const activeNav = document.querySelector('.sidebar-nav-item.active');
        if (activeNav) activeNav.style.textShadow = `0 0 12px ${colors.bg}`;
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // UI DENSITY TOGGLE
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    document.querySelectorAll('.density-opt').forEach(opt => {
        opt.addEventListener('click', function () {
            const density = this.dataset.density;
            currentState.density = density;

            document.querySelectorAll('.density-opt').forEach(o => o.classList.remove('active'));
            this.classList.add('active');

            document.body.classList.toggle('density-compact', density === 'compact');
        });
    });

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // ANIMATIONS TOGGLE
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    if (animToggle) {
        animToggle.addEventListener('change', function () {
            currentState.animations = this.checked;
            document.body.classList.toggle('no-animations', !this.checked);
        });
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // CENTRALIZED PROFILE PROPAGATION
    // Single source of truth ΓåÆ updates ALL UI
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    const previewPostName = document.getElementById('previewPostName');

    function propagateProfile() {
        const s = currentState;

        // ΓöÇΓöÇ 1. Account Page Header ΓöÇΓöÇ
        if (nameDisplay) nameDisplay.textContent = s.name;
        if (bioDisplay) bioDisplay.textContent = s.bio || 'No bio yet';
        syncAvatarPreview(avatarImgDisp, avatarInitials, avatarDisplay);

        // Cover photo
        if (coverDisplay) {
            if (s.coverSrc) {
                coverDisplay.style.backgroundImage = `url(${s.coverSrc})`;
                coverDisplay.classList.add('has-image');
            } else {
                coverDisplay.style.backgroundImage = '';
                coverDisplay.classList.remove('has-image');
            }
        }

        // ΓöÇΓöÇ 2. ALL user name displays ΓöÇΓöÇ
        if (postUserName) postUserName.textContent = s.name;
        if (previewPostName) previewPostName.textContent = s.name;

        // ΓöÇΓöÇ 3. UNIVERSAL avatar propagation ΓöÇΓöÇ
        // Update every [data-user-initials] span in the DOM
        document.querySelectorAll('[data-user-initials]').forEach(el => {
            el.textContent = s.initials;
            el.style.display = s.avatarSrc ? 'none' : '';
        });

        // Update every [data-user-avatar-img] image in the DOM
        document.querySelectorAll('[data-user-avatar-img]').forEach(img => {
            if (s.avatarSrc) {
                img.src = s.avatarSrc;
                img.classList.add('visible');
            } else {
                img.src = '';
                img.classList.remove('visible');
            }
        });

        // ΓöÇΓöÇ 4. Edit View (sync avatar circle) ΓöÇΓöÇ
        syncAvatarPreview(editAvatarImg, editAvatarInit, editAvatarCircle);

        // ΓöÇΓöÇ 5. Live Preview Card ΓöÇΓöÇ
        updateLivePreview();
    }

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // SAVE CHANGES
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    saveBtn.addEventListener('click', function () {
        const newName = nameInput.value.trim();
        const newBio = bioInput.value.trim();

        if (!newName) {
            nameInput.style.borderColor = 'rgba(239, 68, 68, 0.6)';
            nameInput.focus();
            setTimeout(() => { nameInput.style.borderColor = ''; }, 1500);
            return;
        }

        // Update centralized state
        currentState.name = newName;
        currentState.bio = newBio;
        currentState.initials = newName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        // Propagate to ALL UI components
        propagateProfile();

        // Save button feedback
        saveBtn.classList.add('saved');
        const origText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
        setTimeout(() => {
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = origText;
        }, 1200);
    });

    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    // RESET
    // ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
    resetBtn.addEventListener('click', function () {
        currentState = { ...DEFAULTS };

        // Reset edit form fields
        nameInput.value = DEFAULTS.name;
        bioInput.value = DEFAULTS.bio;
        updateCharCounter();

        // Reset avatar upload
        editAvatarImg.classList.remove('visible');
        editAvatarImg.src = '';
        editAvatarInit.style.display = '';
        editAvatarInit.textContent = DEFAULTS.initials;
        editAvatarCircle.classList.remove('avatar-gradient', 'avatar-glass');
        picInput.value = '';

        // Show avatar style group again
        if (avatarStyleGroup) avatarStyleGroup.style.display = '';

        // Reset avatar style picker
        if (avatarStylePicker) {
            avatarStylePicker.querySelectorAll('.avatar-style-opt').forEach(o => {
                o.classList.toggle('active', o.dataset.style === DEFAULTS.avatarStyle);
            });
        }

        // Reset cover upload
        if (coverPreview) {
            coverPreview.style.backgroundImage = '';
            coverPreview.classList.remove('has-image');
        }
        if (coverInput) coverInput.value = '';

        // Reset accent
        accentPicker.querySelectorAll('.accent-swatch').forEach(s => {
            s.classList.toggle('active', s.dataset.accent === DEFAULTS.accent);
        });
        applyAccent(DEFAULTS.accent);

        // Reset density
        document.querySelectorAll('.density-opt').forEach(o => {
            o.classList.toggle('active', o.dataset.density === DEFAULTS.density);
        });
        document.body.classList.remove('density-compact');

        // Reset animations
        if (animToggle) animToggle.checked = true;
        document.body.classList.remove('no-animations');

        // Close emoji panel
        if (emojiPanel) emojiPanel.classList.remove('open');

        // Propagate defaults to ALL UI components
        propagateProfile();

        // Reset button feedback
        resetBtn.style.borderColor = 'rgba(251, 191, 36, 0.5)';
        setTimeout(() => { resetBtn.style.borderColor = ''; }, 600);
    });

})();

/* =========================================================
   Privacy & Security Panel
   Toggles the Privacy sub-view within the Account page.
   Frontend-only ΓÇö state resets on page refresh.
   ========================================================= */
(function () {
    'use strict';

    const mainView = document.getElementById('accountMainView');
    const editView = document.getElementById('editProfileView');
    const privacyView = document.getElementById('privacyView');
    const privacyBtn = document.getElementById('privacyBtn');
    const privacyBack = document.getElementById('privacyBackBtn');

    if (!mainView || !privacyView || !privacyBtn || !privacyBack) return;

    // ΓöÇΓöÇ View toggling ΓöÇΓöÇ
    function showPrivacyView() {
        mainView.style.display = 'none';
        if (editView) editView.classList.remove('active');
        privacyView.classList.add('active');
    }

    function hidePrivacyView() {
        privacyView.classList.remove('active');
        mainView.style.display = '';
    }

    privacyBtn.addEventListener('click', showPrivacyView);
    privacyBack.addEventListener('click', hidePrivacyView);

    // ΓöÇΓöÇ Profile Visibility Toggle ΓöÇΓöÇ
    const profileVisToggle = document.getElementById('profileVisToggle');
    const profileVisBadge = document.getElementById('profileVisBadge');
    const profileVisDesc = document.getElementById('profileVisDesc');

    if (profileVisToggle) {
        profileVisToggle.addEventListener('change', function () {
            const isPublic = this.checked;

            if (profileVisBadge) {
                profileVisBadge.textContent = isPublic ? 'Public' : 'Private';
                profileVisBadge.classList.toggle('public', isPublic);
                profileVisBadge.classList.toggle('private', !isPublic);
            }

            if (profileVisDesc) {
                profileVisDesc.textContent = isPublic
                    ? 'Your profile is visible to everyone'
                    : 'Only you can see your profile';
            }
        });
    }

    // ΓöÇΓöÇ Show Email Toggle ΓöÇΓöÇ
    const showEmailToggle = document.getElementById('showEmailToggle');
    const emailDisplay = document.getElementById('accountEmailDisplay');

    if (showEmailToggle && emailDisplay) {
        showEmailToggle.addEventListener('change', function () {
            emailDisplay.classList.toggle('privacy-hidden', !this.checked);
        });
    }

    // ΓöÇΓöÇ Show Phone Toggle ΓöÇΓöÇ
    const showPhoneToggle = document.getElementById('showPhoneToggle');
    const phoneDisplay = document.getElementById('accountPhoneDisplay');

    if (showPhoneToggle && phoneDisplay) {
        showPhoneToggle.addEventListener('change', function () {
            phoneDisplay.classList.toggle('privacy-hidden', !this.checked);
        });
    }
})();
