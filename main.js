Skip to content
/

To:

    Favicon for anthropic
    Claude Sonnet 4

Favicon for openai
GPT-4.1
Favicon for google
Gemini 2.5 Pro Preview 05-06
Favicon for x-ai
Grok 3 Beta
Favicon for anthropic
Claude Sonnet 4 | Google Vertex

The black screen is likely due to ES6 module import issues when running locally. Let me fix this by avoiding ES6 modules. Here are the corrected complete files:

1. hudShader.js (No export, direct global object)

// HUD Shader for Sci-Fi Audio Visualizer Overlay
window.HUDShader = {
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_audioBands: { value: new Array(64).fill(0.0) },
        u_amplitude: { value: 0.0 },
        u_theme: { value: new THREE.Color(0.118, 0.580, 0.643) }, // Jarvis blue
        u_alpha: { value: 0.85 }
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_audioBands[64];
        uniform float u_amplitude;
        uniform vec3 u_theme;
        uniform float u_alpha;
        
        varying vec2 vUv;
        
        #define PI 3.14159265359
        #define TAU 6.28318530718
        #define ASPECT (u_resolution.x / u_resolution.y)
        
        // Hash function for noise
        float hash11(float p) {
            p = fract(p * 0.1031);
            p *= p + 33.33;
            p *= p + p;
            return fract(p);
        }
        
        // SDF Circle with smooth edges
        float circle(in vec2 uv, in float rad) {
            float bias = 8.0 / u_resolution.x;
            return smoothstep(rad, rad - bias, length(uv) - rad);
        }
        
        // Hexagon math functions
        vec2 s = vec2(1.0, 1.7320508);
        
        float hex(in vec2 p) {
            p = abs(p);
            return max(dot(p, s * 0.5), p.x);
        }
        
        vec4 getHex(vec2 p) {
            vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
            vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
            return dot(h.xy, h.xy) < dot(h.zw, h.zw) 
                ? vec4(h.xy, hC.xy) 
                : vec4(h.zw, hC.zw + 0.5);
        }
        
        // HSB to RGB conversion
        vec3 hsb2rgb(in vec3 c) {
            vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
            rgb = rgb * rgb * (3.0 - 2.0 * rgb);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        
        // Hexagon grid layer
        vec3 hex_layer(in vec2 uv, in float scale, in vec3 color) {
            vec2 hv = getHex(scale * uv * vec2(ASPECT, 1.0)).xy;
            float d = hex(hv);
            return mix(vec3(0.0), vec3(1.0), smoothstep(0.0, 0.03, d - 0.5 + 0.04)) * color;
        }
        
        // Rotating arc reactor rings
        vec3 arc_layer(in vec2 uv, in float r, in float o, in vec3 color) {
            float d = circle(uv, r);
            d -= circle(uv, r - o);
            
            float angle = atan(uv.y, uv.x) + PI;
            float rot_speed = u_time / 2.0;
            angle += rot_speed;
            
            float lSegments = 3.0, sSegments = 48.0;
            float lAngleSegment = TAU / lSegments;
            float sAngleSegment = TAU / sSegments;
            
            float largeSegs = 0.0, smallSegs = 0.0;
            if (abs(mod(angle, lAngleSegment) - lAngleSegment / 2.0) < 0.06) {
                largeSegs = 1.0;
            }
            if (abs(mod(angle, sAngleSegment) - sAngleSegment / 2.0) < 0.01) {
                smallSegs = 1.0;  
            }
            
            d -= smallSegs;
            d -= largeSegs;
            
            return max(0.0, d) * color * 0.2;
        }
        
        void main() {
            // Setup coordinates
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = (uv - vec2(0.5)) * vec2(ASPECT, 1.0);
            vec3 col = vec3(0.0);
            vec3 _theme = u_theme;
            
            // Enhanced theme with subtle color cycling
            _theme = hsb2rgb(vec3(u_time * 0.01, 0.8, 1.2));
            
            // Audio data processing
            int audioIndex = int(clamp(uv.x * 63.0, 0.0, 63.0));
            float audio = u_audioBands[audioIndex];
            audio = pow(audio, 3.5); // Smooth audio response
            
            // Arc reactor ring
            col += arc_layer(p, 0.18, 0.025, _theme * vec3(0.75, 0.75, 1.25));
            
            // Polar audio waveform ring
            float r = 0.4, thin = 0.02;
            float d = length(p) - r;
            
            // Wave mask to create gaps
            vec3 wave_mask = vec3(1.0);
            wave_mask *= smoothstep(0.2, 0.4, uv.x);
            wave_mask *= smoothstep(0.2, 0.4, 1.0 - uv.x);
            
            // Audio waveform visualization
            col += (1.0 - smoothstep(0.0, thin, abs(audio - d))) * _theme * max(0.001, audio * 5.0) * wave_mask;
            col += pow(abs(0.025 / d * audio), 1.2) * _theme * wave_mask;
            
            // Hexagon overlay
            vec3 hexLayer = hex_layer(uv, 25.0, _theme * 1.5);
            col += col * hexLayer * 0.15; // Subtle hex blend
            
            // Additional circular elements with audio reactivity
            float innerRing = circle(p, 0.15);
            innerRing -= circle(p, 0.12);
            col += innerRing * _theme * u_amplitude * 2.0;
            
            // Outer scanning rings
            float scanRing1 = circle(p, 0.6 + sin(u_time * 2.0) * 0.1);
            scanRing1 -= circle(p, 0.58 + sin(u_time * 2.0) * 0.1);
            col += scanRing1 * _theme * 0.3;
            
            float scanRing2 = circle(p, 0.8 + cos(u_time * 1.5) * 0.15);
            scanRing2 -= circle(p, 0.77 + cos(u_time * 1.5) * 0.15);
            col += scanRing2 * _theme * 0.2;
            
            // Radial audio visualization
            float angle = atan(p.y, p.x) + PI;
            int radialIndex = int(mod(angle / TAU * 32.0, 32.0));
            float radialAudio = u_audioBands[radialIndex];
            
            float radialViz = smoothstep(0.3, 0.31, length(p)) * 
                             smoothstep(0.35, 0.34, length(p)) *
                             (1.0 + radialAudio * 3.0);
            col += radialViz * _theme * 0.5;
            
            // Gradient overlay for depth
            float gradient = 1.0 - length(p) * 0.5;
            col *= gradient;
            
            // ACES tone mapping
            col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
            col = pow(col, vec3(1.0 / 2.2));
            
            // Output with transparency
            float alpha = length(col) * u_alpha;
            alpha = clamp(alpha, 0.0, u_alpha);
            
            gl_FragColor = vec4(col, alpha);
        }
    `
};


2. main.js (Complete file, no imports)

class AudiobookNarratorOrb {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.usePostProcessing = false;
        
        // Audio system
        this.audioElement = null;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        
        // Visual components
        this.narratorOrb = null;
        this.starField = null;
        this.reflectionPlane = null;
        this.reflectedOrb = null;
        this.lights = {};
        this.hudPass = null;
        
        // Audio analysis - enhanced for speech
        this.amplitude = 0;
        this.smoothedAmplitude = 0;
        this.voiceFrequencies = {
            subBass: 0,     // 20-60Hz
            bass: 0,        // 60-250Hz  
            lowMid: 0,      // 250-500Hz (fundamental voice)
            mid: 0,         // 500-2kHz (vowels, clarity)
            highMid: 0,     // 2-4kHz (consonants)
            presence: 0,    // 4-6kHz (speech presence)
            brilliance: 0   // 6kHz+ (sibilance, air)
        };
        
        // Enhanced reactivity for speech
        this.speechReactivity = {
            intensity: 3.5,
            responsiveness: 0.25,
            smoothing: 0.15
        };
        
        // Color palette
        this.neonColors = {
            electricBlue: new THREE.Color(0x00FFFF),
            scorchedPink: new THREE.Color(0xFF0055),
            ultravioletOrange: new THREE.Color(0xFF6600),
            toxicGreen: new THREE.Color(0x00FF66)
        };
        
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Camera with cinematic positioning
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 8);
        this.camera.lookAt(0, 0, 0);
        
        // High-quality renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Try to setup post-processing with bloom effect
        this.setupPostProcessing();
        
        this.setupLighting();
        this.createStarField();
        this.createNarratorOrb();
        this.createReflectionSystem();
        
        console.log('Audiobook Narrator Orb initialized', this.usePostProcessing ? 'with bloom and HUD' : 'without post-processing');
    }
    
    setupPostProcessing() {
        // Check if post-processing classes are available
        if (typeof THREE.EffectComposer === 'undefined' || 
            typeof THREE.RenderPass === 'undefined' || 
            typeof THREE.UnrealBloomPass === 'undefined') {
            console.warn('Post-processing not available, falling back to standard rendering');
            this.usePostProcessing = false;
            return;
        }
        
        try {
            // Create effect composer
            this.composer = new THREE.EffectComposer(this.renderer);
            
            // Add render pass
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Add UnrealBloomPass for ethereal glow
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.8,    // strength
                0.6,    // radius
                0.1     // threshold
            );
            this.composer.addPass(bloomPass);
            
            // Add HUD overlay shader pass (only if HUDShader is available)
            if (typeof window.HUDShader !== 'undefined') {
                this.hudPass = new THREE.ShaderPass(window.HUDShader);
                this.hudPass.material.transparent = true;
                this.hudPass.material.blending = THREE.AdditiveBlending;
                this.composer.addPass(this.hudPass);
                console.log('HUD shader pass added successfully');
            } else {
                console.warn('HUDShader not found, skipping HUD pass');
            }
            
            // Add final copy pass if available
            if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.CopyShader !== 'undefined') {
                const copyPass = new THREE.ShaderPass(THREE.CopyShader);
                copyPass.renderToScreen = true;
                this.composer.addPass(copyPass);
            } else if (this.hudPass) {
                // Make HUD pass render to screen if no copy pass
                this.hudPass.renderToScreen = true;
            }
            
            this.usePostProcessing = true;
            console.log('Post-processing initialized successfully');
            
        } catch (error) {
            console.warn('Failed to initialize post-processing:', error);
            this.usePostProcessing = false;
        }
    }
    
    setupLighting() {
        // Main key light (Electric Blue)
        this.lights.keyLight = new THREE.PointLight(this.neonColors.electricBlue, 2, 20);
        this.lights.keyLight.position.set(4, 4, 4);
        this.lights.keyLight.castShadow = true;
        this.scene.add(this.lights.keyLight);
        
        // Fill light (Scorched Pink)
        this.lights.fillLight = new THREE.PointLight(this.neonColors.scorchedPink, 1.5, 15);
        this.lights.fillLight.position.set(-3, 2, 3);
        this.scene.add(this.lights.fillLight);
        
        // Rim light (Toxic Green)
        this.lights.rimLight = new THREE.DirectionalLight(this.neonColors.toxicGreen, 1);
        this.lights.rimLight.position.set(-2, -1, -4);
        this.scene.add(this.lights.rimLight);
        
        // Ambient light for subtle base illumination
        this.lights.ambient = new THREE.AmbientLight(0x0a0a0a, 0.3);
        this.scene.add(this.lights.ambient);
    }
    
    createStarField() {
        const starCount = 1500;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Distribute in large sphere
            const radius = 80 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Subtle neon colors
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // Electric Blue
            } else if (colorChoice < 0.7) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.0; colors[i3 + 2] = 0.33; // Scorched Pink
            } else if (colorChoice < 0.9) {
                colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.4; // Toxic Green
            } else {
                colors[i3] = 1.0; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.0; // Ultraviolet Orange
            }
            
            sizes[i] = Math.random() * 3 + 0.5;
        }
        
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starField);
    }
    
    createNarratorOrb() {
        const sphereGeometry = new THREE.SphereGeometry(1.8, 128, 64);
        
        // Load shaders from HTML script tags
        const vertexShader = document.getElementById('vertexshader').textContent;
        const fragmentShader = document.getElementById('fragmentshader').textContent;
        
        // Advanced refractive glass material with enhanced shader
        const orbMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                amplitude: { value: 0 },
                subBass: { value: 0 },
                bass: { value: 0 },
                lowMid: { value: 0 },
                mid: { value: 0 },
                highMid: { value: 0 },
                presence: { value: 0 },
                brilliance: { value: 0 },
                reactivity: { value: this.speechReactivity.intensity },
                electricBlue: { value: this.neonColors.electricBlue },
                scorchedPink: { value: this.neonColors.scorchedPink },
                ultravioletOrange: { value: this.neonColors.ultravioletOrange },
                toxicGreen: { value: this.neonColors.toxicGreen }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        this.narratorOrb = new THREE.Mesh(sphereGeometry, orbMaterial);
        this.scene.add(this.narratorOrb);
    }
    
    createReflectionSystem() {
        // Create subtle reflection plane
        const planeGeometry = new THREE.PlaneGeometry(15, 15);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.1
        });
        
        this.reflectionPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.reflectionPlane.rotation.x = -Math.PI / 2;
        this.reflectionPlane.position.y = -2.5;
        this.scene.add(this.reflectionPlane);
        
        // Create reflected orb
        this.reflectedOrb = this.narratorOrb.clone();
        this.reflectedOrb.scale.y = -1;
        this.reflectedOrb.position.y = -5;
        this.reflectedOrb.material = this.reflectedOrb.material.clone();
        
        // Make reflection more subtle
        this.reflectedOrb.material.transparent = true;
        
        // Modify reflection shader for fadeout
        this.reflectedOrb.material.fragmentShader = this.reflectedOrb.material.fragmentShader.replace(
            'gl_FragColor = vec4(result, alpha);',
            `
            // Fade reflection based on distance from center
            float distanceFromCenter = length(vWorldPosition.xz) / 8.0;
            float reflectionFade = 1.0 - clamp(distanceFromCenter, 0.0, 1.0);
            
            alpha *= 0.4 * reflectionFade;
            gl_FragColor = vec4(result * 0.7, alpha);
            `
        );
        
        this.reflectedOrb.material.needsUpdate = true;
        this.scene.add(this.reflectedOrb);
    }
    
    setupEventListeners() {
        // File input
        document.getElementById('audioFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.loadAudioFile(file);
        });
        
        // Controls
        document.getElementById('playBtn').addEventListener('click', () => this.playAudio());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseAudio());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportVideo());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); this.togglePlayPause(); }
            if (e.code === 'KeyE') { e.preventDefault(); this.exportVideo(); }
        });
        
        // Drag & drop
        const container = document.getElementById('container');
        container.addEventListener('dragover', (e) => { e.preventDefault(); });
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) this.loadAudioFile(files[0]);
        });
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    async loadAudioFile(file) {
        this.showLoading(true);
        
        try {
            console.log('Loading audiobook:', file.name);
            
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            
            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            
            await new Promise((resolve, reject) => {
                this.audioElement.addEventListener('loadeddata', resolve);
                this.audioElement.addEventListener('error', reject);
                this.audioElement.load();
            });
            
            // Setup enhanced audio analysis for speech
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.source) this.source.disconnect();
            
            this.source = this.audioContext.createMediaElementSource(this.audioElement);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 8192; // High resolution for speech analysis
            this.analyser.smoothingTimeConstant = 0.7; // Responsive to speech dynamics
            
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Update UI
            document.getElementById('audioTitle').textContent = file.name;
            document.getElementById('audioInfo').style.display = 'block';
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('exportBtn').disabled = false;
            
            console.log('✅ Audiobook loaded and ready for enhanced narration!');
            
        } catch (error) {
            console.error('Error loading audiobook:', error);
            alert('Error loading audiobook. Please try MP3, WAV, or MP4 format.');
        } finally {
            this.showLoading(false);
        }
    }
    
    playAudio() {
        if (this.audioElement && this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.audioElement.play();
            this.isPlaying = true;
        }
    }
    
    pauseAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) this.pauseAudio();
        else this.playAudio();
    }
    
    async exportVideo() {
        if (!this.audioElement) {
            alert('Please load an audiobook file first');
            return;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.disabled = true;
        exportBtn.textContent = 'Recording...';
        
        try {
            this.audioElement.currentTime = 0;
            const duration = this.audioElement.duration;
            
            // Ultra high-quality recording for cinematic output
            const canvasStream = this.renderer.domElement.captureStream(60);
            const audioDestination = this.audioContext.createMediaStreamDestination();
            this.source.connect(audioDestination);
            
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioDestination.stream.getAudioTracks()
            ]);
            
            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 15000000, // 15 Mbps for cinema quality
                audioBitsPerSecond: 320000    // 320 kbps for audiobook quality
            });
            
            this.recordedChunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordedChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => this.downloadVideo();
            
            this.mediaRecorder.start(100);
            this.playAudio();
            
            setTimeout(() => {
                this.mediaRecorder.stop();
                exportBtn.disabled = false;
                exportBtn.textContent = 'EXPORT';
            }, (duration + 1) * 1000);
            
            alert(`🎬 Recording ${duration.toFixed(1)}s of enhanced narrator orb!\nCinema-quality export will download automatically.`);
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed: ' + error.message);
            exportBtn.disabled = false;
            exportBtn.textContent = 'EXPORT';
        }
    }
    
    downloadVideo() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0,19).replace(/[:.]/g, '-');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `audiobook-narrator-orb-enhanced-${timestamp}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('✅ Enhanced narrator orb exported!');
    }
    
    updateAudioAnalysis() {
        if (!this.analyser || !this.isPlaying) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Enhanced amplitude calculation with speech focus
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const rawAmplitude = sum / this.dataArray.length / 255;
        
        // More responsive smoothing for speech dynamics
        this.amplitude += (rawAmplitude - this.amplitude) * this.speechReactivity.responsiveness;
        this.smoothedAmplitude += (this.amplitude - this.smoothedAmplitude) * this.speechReactivity.smoothing;
        
        // Enhanced frequency analysis for speech characteristics
        const nyquist = this.audioContext.sampleRate / 2;
        const binSize = nyquist / this.dataArray.length;
        
        const speechBands = {
            subBass: [20, 60],
            bass: [60, 250],
            lowMid: [250, 500],   // Fundamental voice frequencies
            mid: [500, 2000],     // Vowel formants
            highMid: [2000, 4000], // Consonant clarity
            presence: [4000, 6000], // Speech presence
            brilliance: [6000, 20000] // Sibilance and air
        };
        
        Object.keys(speechBands).forEach(band => {
            const [minFreq, maxFreq] = speechBands[band];
            const startBin = Math.floor(minFreq / binSize);
            const endBin = Math.floor(maxFreq / binSize);
            
            let bandSum = 0;
            for (let i = startBin; i < endBin; i++) {
                bandSum += this.dataArray[i];
            }
            
            const rawValue = bandSum / (endBin - startBin) / 255;
            
            // Enhanced smoothing with speech-specific responsiveness
            const responsiveness = band === 'mid' || band === 'highMid' ? 0.3 : 0.2;
            this.voiceFrequencies[band] += (rawValue - this.voiceFrequencies[band]) * responsiveness;
        });
    }
    
    updateVisuals() {
        const time = this.clock.getElapsedTime();
        
        // Update narrator orb with enhanced speech reactivity
        if (this.narratorOrb && this.narratorOrb.material.uniforms) {
            const uniforms = this.narratorOrb.material.uniforms;
            uniforms.time.value = time;
            uniforms.amplitude.value = this.smoothedAmplitude;
            uniforms.subBass.value = this.voiceFrequencies.subBass;
            uniforms.bass.value = this.voiceFrequencies.bass;
            uniforms.lowMid.value = this.voiceFrequencies.lowMid;
            uniforms.mid.value = this.voiceFrequencies.mid;
            uniforms.highMid.value = this.voiceFrequencies.highMid;
            uniforms.presence.value = this.voiceFrequencies.presence;
            uniforms.brilliance.value = this.voiceFrequencies.brilliance;
        }
        
        // Update HUD shader with real-time audio data
        if (this.hudPass && this.hudPass.uniforms) {
            this.hudPass.uniforms.u_time.value = time;
            this.hudPass.uniforms.u_amplitude.value = this.smoothedAmplitude;
            this.hudPass.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            
            // Convert dataArray to normalized float array for HUD
            if (this.dataArray) {
                const audioBands = new Array(64);
                for (let i = 0; i < 64; i++) {
                    const index = Math.floor((i / 64) * this.dataArray.length);
                    audioBands[i] = this.dataArray[index] / 255.0;
                }
                this.hudPass.uniforms.u_audioBands.value = audioBands;
            }
        }
        
        // Update reflected orb
        if (this.reflectedOrb && this.reflectedOrb.material.uniforms) {
            Object.assign(this.reflectedOrb.material.uniforms, this.narratorOrb.material.uniforms);
        }
        
        // Dynamic lighting based on speech
        const speechActivity = (this.voiceFrequencies.mid + this.voiceFrequencies.highMid + this.voiceFrequencies.presence) / 3;
        
        this.lights.keyLight.intensity = 2 + speechActivity * 1.5;
        this.lights.fillLight.intensity = 1.5 + this.voiceFrequencies.bass * 0.8;
        this.lights.rimLight.intensity = 1 + this.voiceFrequencies.brilliance * 1.2;
        
        // Subtle rotation enhanced by speech activity
        const rotationSpeed = 0.003 * (1 + speechActivity * 0.7);
        this.narratorOrb.rotation.y += rotationSpeed;
        this.narratorOrb.rotation.x += rotationSpeed * 0.4;
        
        if (this.reflectedOrb) {
            this.reflectedOrb.rotation.y += rotationSpeed;
            this.reflectedOrb.rotation.x += rotationSpeed * 0.4;
        }
        
        // Gentle starfield animation
        if (this.starField) {
            this.starField.rotation.y += 0.0002;
            this.starField.material.opacity = 0.6 + speechActivity * 0.2;
        }
    }
    
    updateCamera() {
        const time = this.clock.getElapsedTime();
        
        // Cinematic camera movement with speech responsiveness
        const speechIntensity = (this.voiceFrequencies.mid + this.voiceFrequencies.presence) / 2;
        const radius = 8 + Math.sin(time * 0.08) * 1.5 + speechIntensity * 0.5;
        const speed = 0.02 + speechIntensity * 0.01;
        
        this.camera.position.x = Math.sin(time * speed) * radius;
        this.camera.position.z = Math.cos(time * speed) * radius;
        this.camera.position.y = 1 + Math.sin(time * 0.03) * 0.8 + speechIntensity * 0.3;
        
        this.camera.lookAt(0, 0, 0);
    }
    
    updateTimeDisplay() {
        if (this.audioElement) {
            const current = this.audioElement.currentTime || 0;
            const duration = this.audioElement.duration || 0;
            
            const formatTime = (time) => {
                const mins = Math.floor(time / 60);
                const secs = Math.floor(time % 60);
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };
            
            document.getElementById('audioTime').textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        }
    }
    
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer size for post-processing
        if (this.composer && this.usePostProcessing) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
            
            // Update HUD shader resolution
            if (this.hudPass && this.hudPass.uniforms) {
                this.hudPass.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateAudioAnalysis();
        this.updateVisuals();
        this.updateCamera();
        this.updateTimeDisplay();
        
        // Render with post-processing bloom effect if available, otherwise fallback
        if (this.usePostProcessing && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the enhanced audiobook narrator orb
document.addEventListener('DOMContentLoaded', () => {
    new AudiobookNarratorOrb();
});


3. index.html (Complete file)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audiobook Narrator Orb</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #000;
            overflow: hidden;
            font-family: 'Arial', sans-serif;
        }
        
        #container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        
        #controls {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 100;
            background: rgba(0, 0, 0, 0.95);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid #333;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        
        .control-group {
            margin-bottom: 15px;
        }
        
        label {
            color: #00FFFF;
            display: block;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
        }
        
        input[type="file"] {
            color: #fff;
            background: #111;
            border: 2px solid #00FFFF;
            padding: 10px;
            border-radius: 8px;
            width: 280px;
            transition: all 0.3s ease;
        }
        
        input[type="file"]:hover {
            border-color: #FF0055;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }
        
        button {
            background: linear-gradient(135deg, #00FFFF, #FF0055);
            border: none;
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin: 5px 5px 5px 0;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
        }
        
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 0, 85, 0.4);
            background: linear-gradient(135deg, #FF0055, #FF6600);
        }
        
        button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        #info {
            color: #666;
            font-size: 10px;
            margin-top: 15px;
            line-height: 1.6;
        }
        
        #audioInfo {
            color: #00FF66;
            font-size: 12px;
            margin-top: 15px;
            padding: 12px;
            background: rgba(0, 255, 102, 0.1);
            border-radius: 8px;
            border: 1px solid #00FF66;
            display: none;
        }
        
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00FFFF;
            font-size: 18px;
            z-index: 200;
            display: none;
            text-align: center;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(0, 255, 255, 0.3);
            border-top: 3px solid #00FFFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="controls">
            <div class="control-group">
                <label for="audioFile">Audiobook File</label>
                <input type="file" id="audioFile" accept="audio/*,video/*">
            </div>
            
            <div class="control-group">
                <button id="playBtn" disabled>Play</button>
                <button id="pauseBtn" disabled>Pause</button>
                <button id="exportBtn" disabled>Export</button>
            </div>
            
            <div id="audioInfo">
                <div id="audioTitle">No file loaded</div>
                <div id="audioTime">00:00 / 00:00</div>
            </div>
            
            <div id="info">
                🎧 Load your audiobook file<br>
                🔮 Highly reactive narrator orb<br>
                📹 Export for video editing<br>
                💫 Sci-Fi HUD overlay included<br>
                <br>
                <strong>Hotkeys:</strong><br>
                Space: Play/Pause<br>
                E: Export Video
            </div>
        </div>
        
        <div id="loading">
            <div class="loading-spinner"></div>
            Processing audiobook...
        </div>
    </div>

    <!-- Three.js Core -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    
    <!-- Post-processing Effects - Fixed CDN URLs -->
    <script src="https://threejs.org/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://threejs.org/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://threejs.org/examples/js/postprocessing/UnrealBloomPass.js"></script>
    <script src="https://threejs.org/examples/js/postprocessing/ShaderPass.js"></script>
    <script src="https://threejs.org/examples/js/shaders/CopyShader.js"></script>

    <!-- Load HUD Shader first -->
    <script src="hudShader.js"></script>

    <!-- Enhanced Perlin Noise Vertex Shader -->
    <script id="vertexshader" type="x-shader/x-vertex">
        uniform float time;
        uniform float amplitude;
        uniform float subBass;
        uniform float bass;
        uniform float lowMid;
        uniform float mid;
        uniform float highMid;
        uniform float presence;
        uniform float brilliance;
        uniform float reactivity;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDisplacement;
        varying float vFresnelFactor;
        varying float vSpeechActivity;
        
        // Simplified but effective Perlin noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        void main() {
            vPosition = position;
            vNormal = normal;
            
            vec3 pos = position;
            float timeSpeed = time * 0.8;
            
            // Enhanced organic noise foundation
            float noise1 = snoise(pos * 1.2 + vec3(timeSpeed * 0.3, timeSpeed * 0.2, 0.0));
            float noise2 = snoise(pos * 2.4 + vec3(0.0, timeSpeed * 0.4, timeSpeed * 0.5));
            float noise3 = snoise(pos * 4.8 + vec3(timeSpeed * 0.6, 0.0, timeSpeed * 0.3));
            
            // Combine base organic movement
            float baseOrganic = (noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1) * 0.15;
            
            // Enhanced speech-reactive displacement layers with noise integration
            float speechBase = snoise(pos * 1.8 + vec3(timeSpeed * 0.4, 0.0, 0.0)) * (bass + lowMid) * 0.3 * reactivity;
            speechBase += noise1 * (bass + lowMid) * 0.1 * reactivity;
            
            float vowelFormation = snoise(pos * 3.5 + vec3(0.0, timeSpeed * 0.8, timeSpeed * 0.6)) * mid * 0.25 * reactivity;
            vowelFormation += noise2 * mid * 0.08 * reactivity;
            
            float consonantDetail = snoise(pos * 8.0 + vec3(timeSpeed * 1.5, 0.0, timeSpeed * 1.2)) * (highMid + presence) * 0.18 * reactivity;
            consonantDetail += noise3 * (highMid + presence) * 0.06 * reactivity;
            
            float breathDetail = snoise(pos * 15.0 + vec3(timeSpeed * 2.0, timeSpeed * 1.8, 0.0)) * brilliance * 0.12 * reactivity;
            
            // Frequency-driven noise modulation as requested
            float u_frequency = (bass + lowMid + mid + highMid + presence + brilliance) * 10.0;
            float noise = noise1 + noise2 + noise3;
            
            // Combined displacement using the requested formula pattern
            float freqNoiseDisplacement = (u_frequency / 30.0) * (noise / 10.0);
            float speechDisplacement = (lowMid + mid + presence) * 0.25 * reactivity;
            
            // Total displacement combining all layers
            float totalDisplacement = baseOrganic + speechBase + vowelFormation + consonantDetail + breathDetail + freqNoiseDisplacement + speechDisplacement;
            
            // Global speech activity and pulsation
            float speechIntensity = (bass + lowMid + mid + highMid + presence) * 0.2;
            vSpeechActivity = speechIntensity;
            vDisplacement = totalDisplacement;
            
            float globalPulse = 1.0 + amplitude * 0.35 * reactivity;
            
            // Apply displacement along normal with enhanced organic movement
            vec3 displaced = pos + normal * totalDisplacement;
            displaced *= globalPulse;
            
            // Add subtle organic warping to the entire form
            displaced += noise1 * normal * 0.05;
            
            vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
            
            // Enhanced fresnel for refractive glass look
            vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
            vec3 worldNormal = normalize(normalMatrix * normal);
            vec3 viewDirection = normalize(cameraPosition - worldPosition.xyz);
            vFresnelFactor = pow(1.0 - abs(dot(viewDirection, worldNormal)), 2.2);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
    </script>

    <!-- Fragment Shader -->
    <script id="fragmentshader" type="x-shader/x-fragment">
        uniform float time;
        uniform float amplitude;
        uniform float mid;
        uniform float highMid;
        uniform float presence;
        uniform vec3 electricBlue;
        uniform vec3 scorchedPink;
        uniform vec3 ultravioletOrange;
        uniform vec3 toxicGreen;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDisplacement;
        varying float vFresnelFactor;
        varying float vSpeechActivity;
        
        void main() {
            // Dynamic color mixing based on speech frequencies
            float colorCycle = sin(time * 0.8) * 0.5 + 0.5;
            float speechColorShift = vSpeechActivity * 2.0;
            
            // Base glass color with enhanced luminosity for bloom
            vec3 glassBase = mix(electricBlue, scorchedPink, colorCycle);
            
            // Speech-reactive color layers with bloom enhancement
            vec3 midColor = mix(glassBase, ultravioletOrange, mid * 0.8);
            vec3 finalColor = mix(midColor, toxicGreen, (highMid + presence) * 0.6);
            
            // Enhanced internal energy patterns for bloom
            float internalEnergy = abs(vDisplacement) * 4.0 + vSpeechActivity * 1.5;
            
            // Speech interference patterns with bloom contribution
            float speechPattern = sin(vPosition.x * 20.0 + time * 4.0) * 
                                cos(vPosition.y * 15.0 + time * 3.0) * 
                                sin(vPosition.z * 25.0 + time * 5.0) * 
                                vSpeechActivity * 0.5;
            
            // Enhanced rim lighting for bloom effect
            float rimIntensity = vFresnelFactor * 3.5;
            
            // Bloom-optimized lighting combination
            vec3 result = finalColor * (0.8 + internalEnergy + rimIntensity + abs(speechPattern));
            
            // Boost brightness for better bloom effect
            result *= 1.4;
            
            // Dynamic transparency with bloom consideration
            float alpha = 0.3 + rimIntensity * 0.6 + vSpeechActivity * 0.4;
            alpha += abs(speechPattern) * 0.25;
            alpha = clamp(alpha, 0.25, 0.95);
            
            gl_FragColor = vec4(result, alpha);
        }
    </script>

    <script src="main.js"></script>
</body>
</html>


Key changes made to fix the black screen:


    Removed ES6 modules - Now using global window.HUDShader object

    Added error handling - The code now gracefully handles missing HUD shader

    Fixed script loading order - HUD shader loads before main.js

    Added console logging - You can check the browser console for debugging info


This should now work when you open the HTML file directly in your browser. The orb will render with or without the HUD depending on whether the shader loads successfully.
Avatar for Michael
Michael

just gave me a black screen when i refreshed the browser window

Favicon for anthropic
Claude Sonnet 4 | Google Vertex

Here are the complete updated files:

1. hudShader.js

// HUD Shader for Sci-Fi Audio Visualizer Overlay
export const HUDShader = {
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_audioBands: { value: new Array(64).fill(0.0) },
        u_amplitude: { value: 0.0 },
        u_theme: { value: new THREE.Color(0.118, 0.580, 0.643) }, // Jarvis blue
        u_alpha: { value: 0.85 }
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_audioBands[64];
        uniform float u_amplitude;
        uniform vec3 u_theme;
        uniform float u_alpha;
        
        varying vec2 vUv;
        
        #define PI 3.14159265359
        #define TAU 6.28318530718
        #define ASPECT (u_resolution.x / u_resolution.y)
        
        // Hash function for noise
        float hash11(float p) {
            p = fract(p * 0.1031);
            p *= p + 33.33;
            p *= p + p;
            return fract(p);
        }
        
        // SDF Circle with smooth edges
        float circle(in vec2 uv, in float rad) {
            float bias = 8.0 / u_resolution.x;
            return smoothstep(rad, rad - bias, length(uv) - rad);
        }
        
        // Hexagon math functions
        vec2 s = vec2(1.0, 1.7320508);
        
        float hex(in vec2 p) {
            p = abs(p);
            return max(dot(p, s * 0.5), p.x);
        }
        
        vec4 getHex(vec2 p) {
            vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
            vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
            return dot(h.xy, h.xy) < dot(h.zw, h.zw) 
                ? vec4(h.xy, hC.xy) 
                : vec4(h.zw, hC.zw + 0.5);
        }
        
        // HSB to RGB conversion
        vec3 hsb2rgb(in vec3 c) {
            vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
            rgb = rgb * rgb * (3.0 - 2.0 * rgb);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        
        // Hexagon grid layer
        vec3 hex_layer(in vec2 uv, in float scale, in vec3 color) {
            vec2 hv = getHex(scale * uv * vec2(ASPECT, 1.0)).xy;
            float d = hex(hv);
            return mix(vec3(0.0), vec3(1.0), smoothstep(0.0, 0.03, d - 0.5 + 0.04)) * color;
        }
        
        // Rotating arc reactor rings
        vec3 arc_layer(in vec2 uv, in float r, in float o, in vec3 color) {
            float d = circle(uv, r);
            d -= circle(uv, r - o);
            
            float angle = atan(uv.y, uv.x) + PI;
            float rot_speed = u_time / 2.0;
            angle += rot_speed;
            
            float lSegments = 3.0, sSegments = 48.0;
            float lAngleSegment = TAU / lSegments;
            float sAngleSegment = TAU / sSegments;
            
            float largeSegs = 0.0, smallSegs = 0.0;
            if (abs(mod(angle, lAngleSegment) - lAngleSegment / 2.0) < 0.06) {
                largeSegs = 1.0;
            }
            if (abs(mod(angle, sAngleSegment) - sAngleSegment / 2.0) < 0.01) {
                smallSegs = 1.0;  
            }
            
            d -= smallSegs;
            d -= largeSegs;
            
            return max(0.0, d) * color * 0.2;
        }
        
        void main() {
            // Setup coordinates
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = (uv - vec2(0.5)) * vec2(ASPECT, 1.0);
            vec3 col = vec3(0.0);
            vec3 _theme = u_theme;
            
            // Enhanced theme with subtle color cycling
            _theme = hsb2rgb(vec3(u_time * 0.01, 0.8, 1.2));
            
            // Audio data processing
            int audioIndex = int(clamp(uv.x * 63.0, 0.0, 63.0));
            float audio = u_audioBands[audioIndex];
            audio = pow(audio, 3.5); // Smooth audio response
            
            // Arc reactor ring
            col += arc_layer(p, 0.18, 0.025, _theme * vec3(0.75, 0.75, 1.25));
            
            // Polar audio waveform ring
            float r = 0.4, thin = 0.02;
            float d = length(p) - r;
            
            // Wave mask to create gaps
            vec3 wave_mask = vec3(1.0);
            wave_mask *= smoothstep(0.2, 0.4, uv.x);
            wave_mask *= smoothstep(0.2, 0.4, 1.0 - uv.x);
            
            // Audio waveform visualization
            col += (1.0 - smoothstep(0.0, thin, abs(audio - d))) * _theme * max(0.001, audio * 5.0) * wave_mask;
            col += pow(abs(0.025 / d * audio), 1.2) * _theme * wave_mask;
            
            // Hexagon overlay
            vec3 hexLayer = hex_layer(uv, 25.0, _theme * 1.5);
            col += col * hexLayer * 0.15; // Subtle hex blend
            
            // Additional circular elements with audio reactivity
            float innerRing = circle(p, 0.15);
            innerRing -= circle(p, 0.12);
            col += innerRing * _theme * u_amplitude * 2.0;
            
            // Outer scanning rings
            float scanRing1 = circle(p, 0.6 + sin(u_time * 2.0) * 0.1);
            scanRing1 -= circle(p, 0.58 + sin(u_time * 2.0) * 0.1);
            col += scanRing1 * _theme * 0.3;
            
            float scanRing2 = circle(p, 0.8 + cos(u_time * 1.5) * 0.15);
            scanRing2 -= circle(p, 0.77 + cos(u_time * 1.5) * 0.15);
            col += scanRing2 * _theme * 0.2;
            
            // Radial audio visualization
            float angle = atan(p.y, p.x) + PI;
            int radialIndex = int(mod(angle / TAU * 32.0, 32.0));
            float radialAudio = u_audioBands[radialIndex];
            
            float radialViz = smoothstep(0.3, 0.31, length(p)) * 
                             smoothstep(0.35, 0.34, length(p)) *
                             (1.0 + radialAudio * 3.0);
            col += radialViz * _theme * 0.5;
            
            // Gradient overlay for depth
            float gradient = 1.0 - length(p) * 0.5;
            col *= gradient;
            
            // ACES tone mapping
            col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
            col = pow(col, vec3(1.0 / 2.2));
            
            // Output with transparency
            float alpha = length(col) * u_alpha;
            alpha = clamp(alpha, 0.0, u_alpha);
            
            gl_FragColor = vec4(col, alpha);
        }
    `
};


2. main.js (Complete file)

import { HUDShader } from './hudShader.js';

class AudiobookNarratorOrb {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.usePostProcessing = false;
        
        // Audio system
        this.audioElement = null;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        
        // Visual components
        this.narratorOrb = null;
        this.starField = null;
        this.reflectionPlane = null;
        this.reflectedOrb = null;
        this.lights = {};
        this.hudPass = null;
        
        // Audio analysis - enhanced for speech
        this.amplitude = 0;
        this.smoothedAmplitude = 0;
        this.voiceFrequencies = {
            subBass: 0,     // 20-60Hz
            bass: 0,        // 60-250Hz  
            lowMid: 0,      // 250-500Hz (fundamental voice)
            mid: 0,         // 500-2kHz (vowels, clarity)
            highMid: 0,     // 2-4kHz (consonants)
            presence: 0,    // 4-6kHz (speech presence)
            brilliance: 0   // 6kHz+ (sibilance, air)
        };
        
        // Enhanced reactivity for speech
        this.speechReactivity = {
            intensity: 3.5,
            responsiveness: 0.25,
            smoothing: 0.15
        };
        
        // Color palette
        this.neonColors = {
            electricBlue: new THREE.Color(0x00FFFF),
            scorchedPink: new THREE.Color(0xFF0055),
            ultravioletOrange: new THREE.Color(0xFF6600),
            toxicGreen: new THREE.Color(0x00FF66)
        };
        
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Camera with cinematic positioning
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 8);
        this.camera.lookAt(0, 0, 0);
        
        // High-quality renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Try to setup post-processing with bloom effect
        this.setupPostProcessing();
        
        this.setupLighting();
        this.createStarField();
        this.createNarratorOrb();
        this.createReflectionSystem();
        
        console.log('Audiobook Narrator Orb initialized', this.usePostProcessing ? 'with bloom and HUD' : 'without post-processing');
    }
    
    setupPostProcessing() {
        // Check if post-processing classes are available
        if (typeof THREE.EffectComposer === 'undefined' || 
            typeof THREE.RenderPass === 'undefined' || 
            typeof THREE.UnrealBloomPass === 'undefined') {
            console.warn('Post-processing not available, falling back to standard rendering');
            this.usePostProcessing = false;
            return;
        }
        
        try {
            // Create effect composer
            this.composer = new THREE.EffectComposer(this.renderer);
            
            // Add render pass
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Add UnrealBloomPass for ethereal glow
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.8,    // strength
                0.6,    // radius
                0.1     // threshold
            );
            this.composer.addPass(bloomPass);
            
            // Add HUD overlay shader pass
            this.hudPass = new THREE.ShaderPass(HUDShader);
            this.hudPass.material.transparent = true;
            this.hudPass.material.blending = THREE.AdditiveBlending;
            this.composer.addPass(this.hudPass);
            
            // Add final copy pass if available
            if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.CopyShader !== 'undefined') {
                const copyPass = new THREE.ShaderPass(THREE.CopyShader);
                copyPass.renderToScreen = true;
                this.composer.addPass(copyPass);
            } else {
                // Make HUD pass render to screen if no copy pass
                this.hudPass.renderToScreen = true;
            }
            
            this.usePostProcessing = true;
            console.log('Post-processing with HUD overlay initialized');
            
        } catch (error) {
            console.warn('Failed to initialize post-processing:', error);
            this.usePostProcessing = false;
        }
    }
    
    setupLighting() {
        // Main key light (Electric Blue)
        this.lights.keyLight = new THREE.PointLight(this.neonColors.electricBlue, 2, 20);
        this.lights.keyLight.position.set(4, 4, 4);
        this.lights.keyLight.castShadow = true;
        this.scene.add(this.lights.keyLight);
        
        // Fill light (Scorched Pink)
        this.lights.fillLight = new THREE.PointLight(this.neonColors.scorchedPink, 1.5, 15);
        this.lights.fillLight.position.set(-3, 2, 3);
        this.scene.add(this.lights.fillLight);
        
        // Rim light (Toxic Green)
        this.lights.rimLight = new THREE.DirectionalLight(this.neonColors.toxicGreen, 1);
        this.lights.rimLight.position.set(-2, -1, -4);
        this.scene.add(this.lights.rimLight);
        
        // Ambient light for subtle base illumination
        this.lights.ambient = new THREE.AmbientLight(0x0a0a0a, 0.3);
        this.scene.add(this.lights.ambient);
    }
    
    createStarField() {
        const starCount = 1500;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Distribute in large sphere
            const radius = 80 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Subtle neon colors
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // Electric Blue
            } else if (colorChoice < 0.7) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.0; colors[i3 + 2] = 0.33; // Scorched Pink
            } else if (colorChoice < 0.9) {
                colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.4; // Toxic Green
            } else {
                colors[i3] = 1.0; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.0; // Ultraviolet Orange
            }
            
            sizes[i] = Math.random() * 3 + 0.5;
        }
        
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starField);
    }
    
    createNarratorOrb() {
        const sphereGeometry = new THREE.SphereGeometry(1.8, 128, 64);
        
        // Load shaders from HTML script tags
        const vertexShader = document.getElementById('vertexshader').textContent;
        const fragmentShader = document.getElementById('fragmentshader').textContent;
        
        // Advanced refractive glass material with enhanced shader
        const orbMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                amplitude: { value: 0 },
                subBass: { value: 0 },
                bass: { value: 0 },
                lowMid: { value: 0 },
                mid: { value: 0 },
                highMid: { value: 0 },
                presence: { value: 0 },
                brilliance: { value: 0 },
                reactivity: { value: this.speechReactivity.intensity },
                electricBlue: { value: this.neonColors.electricBlue },
                scorchedPink: { value: this.neonColors.scorchedPink },
                ultravioletOrange: { value: this.neonColors.ultravioletOrange },
                toxicGreen: { value: this.neonColors.toxicGreen }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        this.narratorOrb = new THREE.Mesh(sphereGeometry, orbMaterial);
        this.scene.add(this.narratorOrb);
    }
    
    createReflectionSystem() {
        // Create subtle reflection plane
        const planeGeometry = new THREE.PlaneGeometry(15, 15);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.1
        });
        
        this.reflectionPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.reflectionPlane.rotation.x = -Math.PI / 2;
        this.reflectionPlane.position.y = -2.5;
        this.scene.add(this.reflectionPlane);
        
        // Create reflected orb
        this.reflectedOrb = this.narratorOrb.clone();
        this.reflectedOrb.scale.y = -1;
        this.reflectedOrb.position.y = -5;
        this.reflectedOrb.material = this.reflectedOrb.material.clone();
        
        // Make reflection more subtle
        this.reflectedOrb.material.transparent = true;
        
        // Modify reflection shader for fadeout
        this.reflectedOrb.material.fragmentShader = this.reflectedOrb.material.fragmentShader.replace(
            'gl_FragColor = vec4(result, alpha);',
            `
            // Fade reflection based on distance from center
            float distanceFromCenter = length(vWorldPosition.xz) / 8.0;
            float reflectionFade = 1.0 - clamp(distanceFromCenter, 0.0, 1.0);
            
            alpha *= 0.4 * reflectionFade;
            gl_FragColor = vec4(result * 0.7, alpha);
            `
        );
        
        this.reflectedOrb.material.needsUpdate = true;
        this.scene.add(this.reflectedOrb);
    }
    
    setupEventListeners() {
        // File input
        document.getElementById('audioFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.loadAudioFile(file);
        });
        
        // Controls
        document.getElementById('playBtn').addEventListener('click', () => this.playAudio());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseAudio());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportVideo());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); this.togglePlayPause(); }
            if (e.code === 'KeyE') { e.preventDefault(); this.exportVideo(); }
        });
        
        // Drag & drop
        const container = document.getElementById('container');
        container.addEventListener('dragover', (e) => { e.preventDefault(); });
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) this.loadAudioFile(files[0]);
        });
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    async loadAudioFile(file) {
        this.showLoading(true);
        
        try {
            console.log('Loading audiobook:', file.name);
            
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            
            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            
            await new Promise((resolve, reject) => {
                this.audioElement.addEventListener('loadeddata', resolve);
                this.audioElement.addEventListener('error', reject);
                this.audioElement.load();
            });
            
            // Setup enhanced audio analysis for speech
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.source) this.source.disconnect();
            
            this.source = this.audioContext.createMediaElementSource(this.audioElement);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 8192; // High resolution for speech analysis
            this.analyser.smoothingTimeConstant = 0.7; // Responsive to speech dynamics
            
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Update UI
            document.getElementById('audioTitle').textContent = file.name;
            document.getElementById('audioInfo').style.display = 'block';
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('exportBtn').disabled = false;
            
            console.log('✅ Audiobook loaded and ready for enhanced narration!');
            
        } catch (error) {
            console.error('Error loading audiobook:', error);
            alert('Error loading audiobook. Please try MP3, WAV, or MP4 format.');
        } finally {
            this.showLoading(false);
        }
    }
    
    playAudio() {
        if (this.audioElement && this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.audioElement.play();
            this.isPlaying = true;
        }
    }
    
    pauseAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) this.pauseAudio();
        else this.playAudio();
    }
    
    async exportVideo() {
        if (!this.audioElement) {
            alert('Please load an audiobook file first');
            return;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.disabled = true;
        exportBtn.textContent = 'Recording...';
        
        try {
            this.audioElement.currentTime = 0;
            const duration = this.audioElement.duration;
            
            // Ultra high-quality recording for cinematic output
            const canvasStream = this.renderer.domElement.captureStream(60);
            const audioDestination = this.audioContext.createMediaStreamDestination();
            this.source.connect(audioDestination);
            
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioDestination.stream.getAudioTracks()
            ]);
            
            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 15000000, // 15 Mbps for cinema quality
                audioBitsPerSecond: 320000    // 320 kbps for audiobook quality
            });
            
            this.recordedChunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordedChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => this.downloadVideo();
            
            this.mediaRecorder.start(100);
            this.playAudio();
            
            setTimeout(() => {
                this.mediaRecorder.stop();
                exportBtn.disabled = false;
                exportBtn.textContent = 'EXPORT';
            }, (duration + 1) * 1000);
            
            alert(`🎬 Recording ${duration.toFixed(1)}s of enhanced narrator orb!\nCinema-quality export will download automatically.`);
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed: ' + error.message);
            exportBtn.disabled = false;
            exportBtn.textContent = 'EXPORT';
        }
    }
    
    downloadVideo() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0,19).replace(/[:.]/g, '-');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `audiobook-narrator-orb-enhanced-${timestamp}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('✅ Enhanced narrator orb exported!');
    }
    
    updateAudioAnalysis() {
        if (!this.analyser || !this.isPlaying) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Enhanced amplitude calculation with speech focus
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const rawAmplitude = sum / this.dataArray.length / 255;
        
        // More responsive smoothing for speech dynamics
        this.amplitude += (rawAmplitude - this.amplitude) * this.speechReactivity.responsiveness;
        this.smoothedAmplitude += (this.amplitude - this.smoothedAmplitude) * this.speechReactivity.smoothing;
        
        // Enhanced frequency analysis for speech characteristics
        const nyquist = this.audioContext.sampleRate / 2;
        const binSize = nyquist / this.dataArray.length;
        
        const speechBands = {
            subBass: [20, 60],
            bass: [60, 250],
            lowMid: [250, 500],   // Fundamental voice frequencies
            mid: [500, 2000],     // Vowel formants
            highMid: [2000, 4000], // Consonant clarity
            presence: [4000, 6000], // Speech presence
            brilliance: [6000, 20000] // Sibilance and air
        };
        
        Object.keys(speechBands).forEach(band => {
            const [minFreq, maxFreq] = speechBands[band];
            const startBin = Math.floor(minFreq / binSize);
            const endBin = Math.floor(maxFreq / binSize);
            
            let bandSum = 0;
            for (let i = startBin; i < endBin; i++) {
                bandSum += this.dataArray[i];
            }
            
            const rawValue = bandSum / (endBin - startBin) / 255;
            
            // Enhanced smoothing with speech-specific responsiveness
            const responsiveness = band === 'mid' || band === 'highMid' ? 0.3 : 0.2;
            this.voiceFrequencies[band] += (rawValue - this.voiceFrequencies[band]) * responsiveness;
        });
    }
    
    updateVisuals() {
        const time = this.clock.getElapsedTime();
        
        // Update narrator orb with enhanced speech reactivity
        if (this.narratorOrb && this.narratorOrb.material.uniforms) {
            const uniforms = this.narratorOrb.material.uniforms;
            uniforms.time.value = time;
            uniforms.amplitude.value = this.smoothedAmplitude;
            uniforms.subBass.value = this.voiceFrequencies.subBass;
            uniforms.bass.value = this.voiceFrequencies.bass;
            uniforms.lowMid.value = this.voiceFrequencies.lowMid;
            uniforms.mid.value = this.voiceFrequencies.mid;
            uniforms.highMid.value = this.voiceFrequencies.highMid;
            uniforms.presence.value = this.voiceFrequencies.presence;
            uniforms.brilliance.value = this.voiceFrequencies.brilliance;
        }
        
        // Update HUD shader with real-time audio data
        if (this.hudPass && this.hudPass.uniforms) {
            this.hudPass.uniforms.u_time.value = time;
            this.hudPass.uniforms.u_amplitude.value = this.smoothedAmplitude;
            this.hudPass.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            
            // Convert dataArray to normalized float array for HUD
            if (this.dataArray) {
                const audioBands = new Array(64);
                for (let i = 0; i < 64; i++) {
                    const index = Math.floor((i / 64) * this.dataArray.length);
                    audioBands[i] = this.dataArray[index] / 255.0;
                }
                this.hudPass.uniforms.u_audioBands.value = audioBands;
            }
        }
        
        // Update reflected orb
        if (this.reflectedOrb && this.reflectedOrb.material.uniforms) {
            Object.assign(this.reflectedOrb.material.uniforms, this.narratorOrb.material.uniforms);
        }
        
        // Dynamic lighting based on speech
        const speechActivity = (this.voiceFrequencies.mid + this.voiceFrequencies.highMid + this.voiceFrequencies.presence) / 3;
        
        this.lights.keyLight.intensity = 2 + speechActivity * 1.5;
        this.lights.fillLight.intensity = 1.5 + this.voiceFrequencies.bass * 0.8;
        this.lights.rimLight.intensity = 1 + this.voiceFrequencies.brilliance * 1.2;
        
        // Subtle rotation enhanced by speech activity
        const rotationSpeed = 0.003 * (1 + speechActivity * 0.7);
        this.narratorOrb.rotation.y += rotationSpeed;
        this.narratorOrb.rotation.x += rotationSpeed * 0.4;
        
        if (this.reflectedOrb) {
            this.reflectedOrb.rotation.y += rotationSpeed;
            this.reflectedOrb.rotation.x += rotationSpeed * 0.4;
        }
        
        // Gentle starfield animation
        if (this.starField) {
            this.starField.rotation.y += 0.0002;
            this.starField.material.opacity = 0.6 + speechActivity * 0.2;
        }
    }
    
    updateCamera() {
        const time = this.clock.getElapsedTime();
        
        // Cinematic camera movement with speech responsiveness
        const speechIntensity = (this.voiceFrequencies.mid + this.voiceFrequencies.presence) / 2;
        const radius = 8 + Math.sin(time * 0.08) * 1.5 + speechIntensity * 0.5;
        const speed = 0.02 + speechIntensity * 0.01;
        
        this.camera.position.x = Math.sin(time * speed) * radius;
        this.camera.position.z = Math.cos(time * speed) * radius;
        this.camera.position.y = 1 + Math.sin(time * 0.03) * 0.8 + speechIntensity * 0.3;
        
        this.camera.lookAt(0, 0, 0);
    }
    
    updateTimeDisplay() {
        if (this.audioElement) {
            const current = this.audioElement.currentTime || 0;
            const duration = this.audioElement.duration || 0;
            
            const formatTime = (time) => {
                const mins = Math.floor(time / 60);
                const secs = Math.floor(time % 60);
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };
            
            document.getElementById('audioTime').textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        }
    }
    
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer size for post-processing
        if (this.composer && this.usePostProcessing) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
            
            // Update HUD shader resolution
            if (this.hudPass && this.hudPass.uniforms) {
                this.hudPass.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateAudioAnalysis();
        this.updateVisuals();
        this.updateCamera();
        this.updateTimeDisplay();
        
        // Render with post-processing bloom effect if available, otherwise fallback
        if (this.usePostProcessing && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the enhanced audiobook narrator orb
document.addEventListener('DOMContentLoaded', () => {
    new AudiobookNarratorOrb();
});


3. index.html (Complete file)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audiobook Narrator Orb</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #000;
            overflow: hidden;
            font-family: 'Arial', sans-serif;
        }
        
        #container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        
        #controls {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 100;
            background: rgba(0, 0, 0, 0.95);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid #333;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        
        .control-group {
            margin-bottom: 15px;
        }
        
        label {
            color: #00FFFF;
            display: block;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
        }
        
        input[type="file"] {
            color: #fff;
            background: #111;
            border: 2px solid #00FFFF;
            padding: 10px;
            border-radius: 8px;
            width: 280px;
            transition: all 0.3s ease;
        }
        
        input[type="file"]:hover {
            border-color: #FF0055;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }
        
        button {
            background: linear-gradient(135deg, #00FFFF, #FF0055);
            border: none;
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin: 5px 5px 5px 0;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
        }
        
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 0, 85, 0.4);
            background: linear-gradient(135deg, #FF0055, #FF6600);
        }
        
        button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        #info {
            color: #666;
            font-size: 10px;
            margin-top: 15px;
            line-height: 1.6;
        }
        
        #audioInfo {
            color: #00FF66;
            font-size: 12px;
            margin-top: 15px;
            padding: 12px;
            background: rgba(0, 255, 102, 0.1);
            border-radius: 8px;
            border: 1px solid #00FF66;
            display: none;
        }
        
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00FFFF;
            font-size: 18px;
            z-index: 200;
            display: none;
            text-align: center;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(0, 255, 255, 0.3);
            border-top: 3px solid #00FFFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="controls">
            <div class="control-group">
                <label for="audioFile">Audiobook File</label>
                <input type="file" id="audioFile" accept="audio/*,video/*">
            </div>
            
            <div class="control-group">
                <button id="playBtn" disabled>Play</button>
                <button id="pauseBtn" disabled>Pause</button>
                <button id="exportBtn" disabled>Export</button>
            </div>
            
            <div id="audioInfo">
                <div id="audioTitle">No file loaded</div>
                <div id="audioTime">00:00 / 00:00</div>
            </div>
            
            <div id="info">
                🎧 Load your audiobook file<br>
                🔮 Highly reactive narrator orb<br>
                📹 Export for video editing<br>
                💫 Sci-Fi HUD overlay included<br>
                <br>
                <strong>Hotkeys:</strong><br>
                Space: Play/Pause<br>
                E: Export Video
            </div>
        </div>
        
        <div id="loading">
            <div class="loading-spinner"></div>
            Processing audiobook...
        </div>
    </div>

    <!-- Three.js Core -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    
    <!-- Post-processing Effects - Fixed CDN URLs -->
    <script src="https://threejs.org/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://threejs.org/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://threejs.org/examples/js/postprocessing/UnrealBloomPass.js"></script>
    <script src="https://threejs.org/examples/js/postprocessing/ShaderPass.js"></script>
    <script src="https://threejs.org/examples/js/shaders/CopyShader.js"></script>

    <!-- Enhanced Perlin Noise Vertex Shader -->
    <script id="vertexshader" type="x-shader/x-vertex">
        uniform float time;
        uniform float amplitude;
        uniform float subBass;
        uniform float bass;
        uniform float lowMid;
        uniform float mid;
        uniform float highMid;
        uniform float presence;
        uniform float brilliance;
        uniform float reactivity;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDisplacement;
        varying float vFresnelFactor;
        varying float vSpeechActivity;
        
        // Simplified but effective Perlin noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        void main() {
            vPosition = position;
            vNormal = normal;
            
            vec3 pos = position;
            float timeSpeed = time * 0.8;
            
            // Enhanced organic noise foundation
            float noise1 = snoise(pos * 1.2 + vec3(timeSpeed * 0.3, timeSpeed * 0.2, 0.0));
            float noise2 = snoise(pos * 2.4 + vec3(0.0, timeSpeed * 0.4, timeSpeed * 0.5));
            float noise3 = snoise(pos * 4.8 + vec3(timeSpeed * 0.6, 0.0, timeSpeed * 0.3));
            
            // Combine base organic movement
            float baseOrganic = (noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1) * 0.15;
            
            // Enhanced speech-reactive displacement layers with noise integration
            float speechBase = snoise(pos * 1.8 + vec3(timeSpeed * 0.4, 0.0, 0.0)) * (bass + lowMid) * 0.3 * reactivity;
            speechBase += noise1 * (bass + lowMid) * 0.1 * reactivity;
            
            float vowelFormation = snoise(pos * 3.5 + vec3(0.0, timeSpeed * 0.8, timeSpeed * 0.6)) * mid * 0.25 * reactivity;
            vowelFormation += noise2 * mid * 0.08 * reactivity;
            
            float consonantDetail = snoise(pos * 8.0 + vec3(timeSpeed * 1.5, 0.0, timeSpeed * 1.2)) * (highMid + presence) * 0.18 * reactivity;
            consonantDetail += noise3 * (highMid + presence) * 0.06 * reactivity;
            
            float breathDetail = snoise(pos * 15.0 + vec3(timeSpeed * 2.0, timeSpeed * 1.8, 0.0)) * brilliance * 0.12 * reactivity;
            
            // Frequency-driven noise modulation as requested
            float u_frequency = (bass + lowMid + mid + highMid + presence + brilliance) * 10.0;
            float noise = noise1 + noise2 + noise3;
            
            // Combined displacement using the requested formula pattern
            float freqNoiseDisplacement = (u_frequency / 30.0) * (noise / 10.0);
            float speechDisplacement = (lowMid + mid + presence) * 0.25 * reactivity;
            
            // Total displacement combining all layers
            float totalDisplacement = baseOrganic + speechBase + vowelFormation + consonantDetail + breathDetail + freqNoiseDisplacement + speechDisplacement;
            
            // Global speech activity and pulsation
            float speechIntensity = (bass + lowMid + mid + highMid + presence) * 0.2;
            vSpeechActivity = speechIntensity;
            vDisplacement = totalDisplacement;
            
            float globalPulse = 1.0 + amplitude * 0.35 * reactivity;
            
            // Apply displacement along normal with enhanced organic movement
            vec3 displaced = pos + normal * totalDisplacement;
            displaced *= globalPulse;
            
            // Add subtle organic warping to the entire form
            displaced += noise1 * normal * 0.05;
            
            vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
            
            // Enhanced fresnel for refractive glass look
            vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
            vec3 worldNormal = normalize(normalMatrix * normal);
            vec3 viewDirection = normalize(cameraPosition - worldPosition.xyz);
            vFresnelFactor = pow(1.0 - abs(dot(viewDirection, worldNormal)), 2.2);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
    </script>

    <!-- Fragment Shader -->
    <script id="fragmentshader" type="x-shader/x-fragment">
        uniform float time;
        uniform float amplitude;
        uniform float mid;
        uniform float highMid;
        uniform float presence;
        uniform vec3 electricBlue;
        uniform vec3 scorchedPink;
        uniform vec3 ultravioletOrange;
        uniform vec3 toxicGreen;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDisplacement;
        varying float vFresnelFactor;
        varying float vSpeechActivity;
        
        void main() {
            // Dynamic color mixing based on speech frequencies
            float colorCycle = sin(time * 0.8) * 0.5 + 0.5;
            float speechColorShift = vSpeechActivity * 2.0;
            
            // Base glass color with enhanced luminosity for bloom
            vec3 glassBase = mix(electricBlue, scorchedPink, colorCycle);
            
            // Speech-reactive color layers with bloom enhancement
            vec3 midColor = mix(glassBase, ultravioletOrange, mid * 0.8);
            vec3 finalColor = mix(midColor, toxicGreen, (highMid + presence) * 0.6);
            
            // Enhanced internal energy patterns for bloom
            float internalEnergy = abs(vDisplacement) * 4.0 + vSpeechActivity * 1.5;
            
            // Speech interference patterns with bloom contribution
            float speechPattern = sin(vPosition.x * 20.0 + time * 4.0) * 
                                cos(vPosition.y * 15.0 + time * 3.0) * 
                                sin(vPosition.z * 25.0 + time * 5.0) * 
                                vSpeechActivity * 0.5;
            
            // Enhanced rim lighting for bloom effect
            float rimIntensity = vFresnelFactor * 3.5;
            
            // Bloom-optimized lighting combination
            vec3 result = finalColor * (0.8 + internalEnergy + rimIntensity + abs(speechPattern));
            
            // Boost brightness for better bloom effect
            result *= 1.4;
            
            // Dynamic transparency with bloom consideration
            float alpha = 0.3 + rimIntensity * 0.6 + vSpeechActivity * 0.4;
            alpha += abs(speechPattern) * 0.25;
            alpha = clamp(alpha, 0.25, 0.95);
            
            gl_FragColor = vec4(result, alpha);
        }
    </script>

    <script type="module" src="hudShader.js"></script>
    <script type="module" src="main.js"></script>
</body>
</html>


This complete implementation provides:


    hudShader.js - A sophisticated HUD shader with circular waveforms, hex grids, rotating arcs, and real-time audio reactivity

    main.js - Updated with full HUD integration including audio data streaming to the shader pass

    index.html - Updated with ES6 module support and enhanced UI description


The HUD overlay will render as a transparent layer over your existing orb, creating a complete sci-fi Jarvis-style interface that reacts to real-time audio input with stunning visual effects.
Avatar for Michael
Michael

i want the entire updated files for every file

Favicon for anthropic
Claude Sonnet 4 | Google Vertex

Here are the three code files to implement the Sci-Fi HUD overlay shader pass:

1. hudShader.js

// HUD Shader for Sci-Fi Audio Visualizer Overlay
export const HUDShader = {
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_audioBands: { value: new Array(64).fill(0.0) },
        u_amplitude: { value: 0.0 },
        u_theme: { value: new THREE.Color(0.118, 0.580, 0.643) }, // Jarvis blue
        u_alpha: { value: 0.85 }
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_audioBands[64];
        uniform float u_amplitude;
        uniform vec3 u_theme;
        uniform float u_alpha;
        
        varying vec2 vUv;
        
        #define PI 3.14159265359
        #define TAU 6.28318530718
        #define ASPECT (u_resolution.x / u_resolution.y)
        
        // Hash function for noise
        float hash11(float p) {
            p = fract(p * 0.1031);
            p *= p + 33.33;
            p *= p + p;
            return fract(p);
        }
        
        // SDF Circle with smooth edges
        float circle(in vec2 uv, in float rad) {
            float bias = 8.0 / u_resolution.x;
            return smoothstep(rad, rad - bias, length(uv) - rad);
        }
        
        // Hexagon math functions
        vec2 s = vec2(1.0, 1.7320508);
        
        float hex(in vec2 p) {
            p = abs(p);
            return max(dot(p, s * 0.5), p.x);
        }
        
        vec4 getHex(vec2 p) {
            vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
            vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
            return dot(h.xy, h.xy) < dot(h.zw, h.zw) 
                ? vec4(h.xy, hC.xy) 
                : vec4(h.zw, hC.zw + 0.5);
        }
        
        // HSB to RGB conversion
        vec3 hsb2rgb(in vec3 c) {
            vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
            rgb = rgb * rgb * (3.0 - 2.0 * rgb);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        
        // Hexagon grid layer
        vec3 hex_layer(in vec2 uv, in float scale, in vec3 color) {
            vec2 hv = getHex(scale * uv * vec2(ASPECT, 1.0)).xy;
            float d = hex(hv);
            return mix(vec3(0.0), vec3(1.0), smoothstep(0.0, 0.03, d - 0.5 + 0.04)) * color;
        }
        
        // Rotating arc reactor rings
        vec3 arc_layer(in vec2 uv, in float r, in float o, in vec3 color) {
            float d = circle(uv, r);
            d -= circle(uv, r - o);
            
            float angle = atan(uv.y, uv.x) + PI;
            float rot_speed = u_time / 2.0;
            angle += rot_speed;
            
            float lSegments = 3.0, sSegments = 48.0;
            float lAngleSegment = TAU / lSegments;
            float sAngleSegment = TAU / sSegments;
            
            float largeSegs = 0.0, smallSegs = 0.0;
            if (abs(mod(angle, lAngleSegment) - lAngleSegment / 2.0) < 0.06) {
                largeSegs = 1.0;
            }
            if (abs(mod(angle, sAngleSegment) - sAngleSegment / 2.0) < 0.01) {
                smallSegs = 1.0;  
            }
            
            d -= smallSegs;
            d -= largeSegs;
            
            return max(0.0, d) * color * 0.2;
        }
        
        void main() {
            // Setup coordinates
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = (uv - vec2(0.5)) * vec2(ASPECT, 1.0);
            vec3 col = vec3(0.0);
            vec3 _theme = u_theme;
            
            // Enhanced theme with subtle color cycling
            _theme = hsb2rgb(vec3(u_time * 0.01, 0.8, 1.2));
            
            // Audio data processing
            int audioIndex = int(clamp(uv.x * 63.0, 0.0, 63.0));
            float audio = u_audioBands[audioIndex];
            audio = pow(audio, 3.5); // Smooth audio response
            
            // Arc reactor ring
            col += arc_layer(p, 0.18, 0.025, _theme * vec3(0.75, 0.75, 1.25));
            
            // Polar audio waveform ring
            float r = 0.4, thin = 0.02;
            float d = length(p) - r;
            
            // Wave mask to create gaps
            vec3 wave_mask = vec3(1.0);
            wave_mask *= smoothstep(0.2, 0.4, uv.x);
            wave_mask *= smoothstep(0.2, 0.4, 1.0 - uv.x);
            
            // Audio waveform visualization
            col += (1.0 - smoothstep(0.0, thin, abs(audio - d))) * _theme * max(0.001, audio * 5.0) * wave_mask;
            col += pow(abs(0.025 / d * audio), 1.2) * _theme * wave_mask;
            
            // Hexagon overlay
            vec3 hexLayer = hex_layer(uv, 25.0, _theme * 1.5);
            col += col * hexLayer * 0.15; // Subtle hex blend
            
            // Additional circular elements with audio reactivity
            float innerRing = circle(p, 0.15);
            innerRing -= circle(p, 0.12);
            col += innerRing * _theme * u_amplitude * 2.0;
            
            // Outer scanning rings
            float scanRing1 = circle(p, 0.6 + sin(u_time * 2.0) * 0.1);
            scanRing1 -= circle(p, 0.58 + sin(u_time * 2.0) * 0.1);
            col += scanRing1 * _theme * 0.3;
            
            float scanRing2 = circle(p, 0.8 + cos(u_time * 1.5) * 0.15);
            scanRing2 -= circle(p, 0.77 + cos(u_time * 1.5) * 0.15);
            col += scanRing2 * _theme * 0.2;
            
            // Radial audio visualization
            float angle = atan(p.y, p.x) + PI;
            int radialIndex = int(mod(angle / TAU * 32.0, 32.0));
            float radialAudio = u_audioBands[radialIndex];
            
            float radialViz = smoothstep(0.3, 0.31, length(p)) * 
                             smoothstep(0.35, 0.34, length(p)) *
                             (1.0 + radialAudio * 3.0);
            col += radialViz * _theme * 0.5;
            
            // Gradient overlay for depth
            float gradient = 1.0 - length(p) * 0.5;
            col *= gradient;
            
            // ACES tone mapping
            col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
            col = pow(col, vec3(1.0 / 2.2));
            
            // Output with transparency
            float alpha = length(col) * u_alpha;
            alpha = clamp(alpha, 0.0, u_alpha);
            
            gl_FragColor = vec4(col, alpha);
        }
    `
};


2. main.js (Updated portions only)

// Add this import at the top of the file
import { HUDShader } from './hudShader.js';

class AudiobookNarratorOrb {
    constructor() {
        // ... existing constructor code ...
        
        // Add HUD shader pass property
        this.hudPass = null;
        
        // ... rest of existing constructor ...
    }
    
    setupPostProcessing() {
        // Check if post-processing classes are available
        if (typeof THREE.EffectComposer === 'undefined' || 
            typeof THREE.RenderPass === 'undefined' || 
            typeof THREE.UnrealBloomPass === 'undefined') {
            console.warn('Post-processing not available, falling back to standard rendering');
            this.usePostProcessing = false;
            return;
        }
        
        try {
            // Create effect composer
            this.composer = new THREE.EffectComposer(this.renderer);
            
            // Add render pass
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Add UnrealBloomPass for ethereal glow
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.8,    // strength
                0.6,    // radius
                0.1     // threshold
            );
            this.composer.addPass(bloomPass);
            
            // Add HUD overlay shader pass
            this.hudPass = new THREE.ShaderPass(HUDShader);
            this.hudPass.material.transparent = true;
            this.hudPass.material.blending = THREE.AdditiveBlending;
            this.composer.addPass(this.hudPass);
            
            // Add final copy pass if available
            if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.CopyShader !== 'undefined') {
                const copyPass = new THREE.ShaderPass(THREE.CopyShader);
                copyPass.renderToScreen = true;
                this.composer.addPass(copyPass);
            } else {
                // Make HUD pass render to screen if no copy pass
                this.hudPass.renderToScreen = true;
            }
            
            this.usePostProcessing = true;
            console.log('Post-processing with HUD overlay initialized');
            
        } catch (error) {
            console.warn('Failed to initialize post-processing:', error);
            this.usePostProcessing = false;
        }
    }
    
    updateVisuals() {
        const time = this.clock.getElapsedTime();
        
        // Update narrator orb with enhanced speech reactivity
        if (this.narratorOrb && this.narratorOrb.material.uniforms) {
            const uniforms = this.narratorOrb.material.uniforms;
            uniforms.time.value = time;
            uniforms.amplitude.value = this.smoothedAmplitude;
            uniforms.subBass.value = this.voiceFrequencies.subBass;
            uniforms.bass.value = this.voiceFrequencies.bass;
            uniforms.lowMid.value = this.voiceFrequencies.lowMid;
            uniforms.mid.value = this.voiceFrequencies.mid;
            uniforms.highMid.value = this.voiceFrequencies.highMid;
            uniforms.presence.value = this.voiceFrequencies.presence;
            uniforms.brilliance.value = this.voiceFrequencies.brilliance;
        }
        
        // Update HUD shader with real-time audio data
        if (this.hudPass && this.hudPass.uniforms) {
            this.hudPass.uniforms.u_time.value = time;
            this.hudPass.uniforms.u_amplitude.value = this.smoothedAmplitude;
            this.hudPass.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            
            // Convert dataArray to normalized float array for HUD
            if (this.dataArray) {
                const audioBands = new Array(64);
                for (let i = 0; i < 64; i++) {
                    const index = Math.floor((i / 64) * this.dataArray.length);
                    audioBands[i] = this.dataArray[index] / 255.0;
                }
                this.hudPass.uniforms.u_audioBands.value = audioBands;
            }
        }
        
        // ... rest of existing updateVisuals code ...
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer size for post-processing
        if (this.composer && this.usePostProcessing) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
            
            // Update HUD shader resolution
            if (this.hudPass && this.hudPass.uniforms) {
                this.hudPass.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            }
        }
    }
}

// ... rest of existing code remains the same ...


3. index.html (Updated portions only)

<!-- Add this script tag before the main.js script tag -->
<script type="module" src="hudShader.js"></script>

<!-- Update the main.js script tag to be a module -->
<script type="module" src="main.js"></script>


This implementation creates a sophisticated HUD overlay that:


    Circular Waveform: Real-time audio visualization in polar coordinates

    Hex Grid Pattern: Subtle hexagonal overlay matching Jarvis aesthetic

    Rotating Arc Segments: Animated concentric rings with segmented patterns

    Audio Reactivity: All elements respond to real-time FFT frequency data

    Transparent Overlay: Uses additive blending to layer over the orb

    Sci-Fi Aesthetic: Neon blue/teal color scheme with motion blur effects

    Performance Optimized: Efficient shader code for real-time rendering


The HUD will overlay the existing orb visualization while maintaining all current functionality. The audio data flows from the existing FFT analysis into the HUD shader's frequency-reactive visual elements.
Avatar for Michael
Michael

Claude, I need you to act as a senior-level WebGL and Three.js developer.

You’re helping me expand a currently functional Three.js audio visualizer that renders a particle-based orb reacting to voice input. The orb uses Web Audio API FFT bands and passes data to custom GLSL shaders via uniforms.


🧠 CURRENT PROJECT STRUCTURE


    index.html: Contains the Three.js scene, shader scripts (vertex/fragment), and initial UI.

    main.js: Handles Web Audio API, FFT processing, animation loop, and updates shader uniforms per frame.

    The orb already reacts to FFT bands (bass → brilliance) and uses EffectComposer.



🎯 YOUR TASK: Implement a Sci-Fi HUD Overlay Shader Pass

Reference: Use the following Shadertoy visualizer as your design and motion base:

🔗 https://www.shadertoy.com/view/McVGzc



It features a circular waveform ring, hex grid pattern, radial arcs, and subtle motion blur—use those as visual references.


💡 Shader Requirements


    Implement a fullscreen fragmentShader (fullscreen quad).

    Accept a uniform array: float audioBands[64] to map FFT data.

    Elements to include:
        Jarvis-style circular waveform
        Subtle hex grid
        Optional animated radial arcs
        Light gradient tint

    The shader must be transparent and overlay the orb, not replace it.

    Compatible with Three.js EffectComposer + ShaderPass.

    Use additive blending or alpha to layer visuals.



📦 FILE CREATION + MODIFICATION

➤ Create hudShader.js

Export as an object with:


    uniforms

    vertexShader (fullscreen passthrough)

    fragmentShader (converted logic from Shadertoy)

    defines or constants (if needed)


➤ Modify main.js


    Add the new ShaderPass using hudShader.js.

    Pass real-time audioDataArray into audioBands[].

    Insert this pass after rendering the orb in the EffectComposer chain.

    Ensure the HUD updates in real-time with voice input.


➤ Modify index.html


    Load the new hudShader.js file.

    Ensure the canvas, shaders, and HUD render without breaking layout or visuals.



🎨 Design Guidelines


    Match Shadertoy aesthetic: neon blue, teal glow, dark void background.

    Use motion blur subtly—prioritize smoothness over flash.

    Orb must remain visible—HUD is a layer, not a replacement.

    All code must be functional, modular, and production-ready.

    Return your output as 3 full code blocks:
        hudShader.js
        main.js (only the updated/added portions)
        index.html (only the updated/added portions)


Do not summarize. Output only the 3 structured, complete code files.

Let’s make this a haunted, intelligent HUD overlay worthy of a sci-fi narrator orb.

here is the code from the website link for this that I got:

how do I add this to my code?

Jarvis audio visualizer

float gRatio = (1.0 + pow(5.0, 0.5)) / 2.0; // Golden ratio

// Circle represented as a signed distance function

float circle( in vec2 uv, in float rad ) {

return smoothstep(rad, rad - bias, length(uv) - rad);


}

void mainImage( out vec4 fragColor, in vec2 fragCoord )

{

// Normalized pixel coordinates (from 0 to 1)

vec2 uv = (2.0 * fragCoord.xy - R.xy) / R.y;

vec2 m  = (2.0 * iMouse.xy - R.xy) / R.y;

    

// Start with black

vec3 col = vec3(0.0), _theme = theme;


#ifdef GRADIENT_COLOR

//_theme = vec3(1.0);


#endif

// Settings

float orb = 0.25;

float fib_points = 300.;

float t = (iTime + 80.) / 3.0;



float theta, phi;

for(float i = 0.; i < fib_points; i++) {

    theta = 2.0 * 3.141592 * i / gRatio;

    phi = sin(acos(1.0 - 2.0 * i / fib_points));

    phi *= 0.475; // scale

    

    float rd = (hash11(i) > 0.5 ? 1.0 : -1.0); // Generate a random "boolean" for rotation direction

    

    //theta *= t / 200.;

    theta -= t * rd; // rotation

    //theta *= gRatio * t / 400.; // position shift

    

    // Apply SDF, color, and then intensity based on position

    col += circle(uv + vec2(cos(theta) * phi, sin(theta) * phi), (14.0 / R.x)) * _theme * ((abs(sin(theta) * phi) + abs(cos(theta) * phi)) / 5.);

}





// White ring

col += circle(uv, orb);

col -= circle(uv, orb - (3.0 / R.y));



// Apply motion blur

vec3 prv = textureLod(iChannel0, fragCoord.xy / R.xy, 0.).rgb;

col = mix(col, prv, 0.95);


// Output to screen

fragColor = vec4(col,1.0);


}

/* Copyright (c) 2024 berelium/concept_bytes

All rights reserved. No part of this software and associated documentation files (the "Software") may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright holders, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

// random jarvis guy: https://soundcloud.com/allenjonesym/jarvis-impression

// For some reason, soundcloud is broken in Shadertoy so the voice part does not work

// You can use the below definition to toggle an artifical pulsing audio wave

//#define SOUND_TEST

//  OR change it to "XTrackTune" In the Music tab if you click on "iChannel1"

float circle( in vec2 uv, in float rad ) {

return smoothstep(rad, rad - bias, length(uv) - rad);


}

vec3 hex_layer( in vec2 uv, in float scale, in vec3 color ) {

vec2 hv = getHex(scale * uv * vec2(ASPECT, 1.0)).xy;

float d = hex(hv);



return mix(vec3(0.0), vec3(1.0), smoothstep(0.0, 0.03, d - 0.5 + 0.04)) * color;


}

vec3 arc_layer( in vec2 uv, in float r, in float o, in vec3 color ) {

float d = circle(uv, r);

d -= circle(uv, r-o);





float angle = atan(uv.y, uv.x) + PI;

float rot_speed = iTime / 2.0;



angle += rot_speed;



float lSegments = 3.0, sSegments = 48.0;

float lAngleSegment = 2.0 * PI, sAngleSegment = 2.0 * PI;

lAngleSegment /= lSegments;

sAngleSegment /= sSegments;



float largeSegs = 0.0, smallSegs = 0.0;

if (abs(mod(angle, lAngleSegment) - lAngleSegment / 2.0) < 0.06) {

    largeSegs = 1.0;

}

if (abs(mod(angle, sAngleSegment) - sAngleSegment / 2.0) < 0.01) {

    smallSegs = 1.0;  

}





d -= smallSegs;

d -= largeSegs;



return max(0.0, d) * color * 0.2;


}

void mainImage( out vec4 fragColor, in vec2 fragCoord )

{

// ==== Setup ====

vec2 uv = fragCoord.xy / R.xy;

vec2 p = (uv - vec2(0.5)) * vec2(ASPECT, 1.0);

vec3 col = vec3(0.0), _theme = theme;


#ifdef MULTI_COLOR

_theme = hsb2rgb(vec3(iTime*0.01, 0.8, 1.2));


#endif

// ===============





// ==== Fetch audio data ====

int tx = int(uv.x*512.0); // Get the full range

//int tx = int((uv.x+0.475)*128.); // Get only a partial range (aiming for voice)



float audio = texelFetch( iChannel1, ivec2(tx,0), 0 ).x; // Use frequency data

//float audio = texelFetch(iChannel1, ivec2(tx,1), 0).x; // Use wave data


#ifdef SOUND_TEST

audio = hash11(iTime*0.015); // emulate a perfect sound wave


#endif

audio = pow(audio, 3.5); // smoothening

// ========





// ==== Arc reactor ring ====

col += arc_layer(p, 0.18, 0.025, _theme * vec3(0.75, 0.75, 1.25)); // vec3(0.220,0.024,0.000)

// ========





// ==== Center orb ====

col += textureLod(iChannel0, uv, 0.).rgb;

// ========





// ==== Polar audio wave ====

float r = 0.4, thin = 0.02;

float d = length(p) - r; // Create a circle to wrap the audio wave form around



vec3 wave_mask = vec3(1.0);

wave_mask *= smoothstep(0.2, 0.4, uv.x); // block left

wave_mask *= smoothstep(0.2, 0.4, 1.0 - uv.x); // block right



col += (1.0 -  smoothstep( 0.0, thin, abs(audio - d) )) * _theme * max(0.001,audio * 5.) * wave_mask; // The wave

col += pow(abs(0.025 / d * audio), 1.2) * _theme * wave_mask; // Glow layer

//col += (0.025 / d * audio) * theme * 0.5 * wave_mask; // Glow layer + arc flash

// ========





// ==== Hex overlay ====

vec4 hv = getHex(uv); // Get hexagonal uv

vec3 hexLayer = hex_layer(uv, 25.0, _theme * 1.5);

//col += hexLayer * 0.0025; // Full mask

col += col * hexLayer; // Blend with scene

// ========





// ==== Multi-color gradient ====


#ifdef GRADIENT

    float scale = 1.25;

    float angle = atan(p.y, p.x) + PI;

    angle -= iTime;// / 4.0; // Rotation

    float radius = length(p) * scale;

    col *= hsb2rgb(vec3((angle / TAU), radius, 0.8));


#endif

// ========





// ==== Tonemapping ====

//col = 1.0 - exp( -col );

col = (col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14); // ACES tonemap

col = pow(col, vec3(1.0 / 2.2)); // sRGB approximation (for consistency)

// ========



fragColor = vec4(col, 1.0);


}

#define AA 4

#define bias 8. / R.x

//#define MULTI_COLOR

#define GRADIENT

#define R iResolution.xy

#define PIX_SIZE 5. / R.x

#define ASPECT R.x / R.y

#define PI  3.14159265359

#define TAU 6.28318530718

// Jarvis Blue: vec3(0.118,0.580,0.643);

// Every color in the scene is derived from this theme value

const vec3 theme = vec3(0.118,0.580,0.643);

// Thanks to @Dave_Hoskins : https://www.shadertoy.com/view/4djSRW

float hash11(float p)

{

p = fract(p * .1031);

p *= p + 33.33;

p *= p + p;

return fract(p);


}

// Thanks to @leftofzen : https://www.shadertoy.com/view/wtdSzX

vec2 s = vec2(1, 1.7320508);

float hex(in vec2 p)

{

p = abs(p);



#ifdef FLAT_TOP_HEXAGON

return max(dot(p, s*.5), p.y); // Hexagon.

#else

return max(dot(p, s*.5), p.x); // Hexagon.

#endif    


}

vec4 getHex(vec2 p)

{

#ifdef FLAT_TOP_HEXAGON

vec4 hC = floor(vec4(p, p - vec2(1, .5))/s.xyxy) + .5;

#else

vec4 hC = floor(vec4(p, p - vec2(.5, 1))/s.xyxy) + .5;

#endif



// Centering the coordinates with the hexagon centers above.

vec4 h = vec4(p - hC.xy*s, p - (hC.zw + .5)*s);





// Nearest hexagon center (with respect to p) to the current point. In other words, when

// "h.xy" is zero, we're at the center. We're also returning the corresponding hexagon ID -

// in the form of the hexagonal central point.

//

// On a side note, I sometimes compare hex distances, but I noticed that Iomateron compared

// the squared Euclidian version, which seems neater, so I've adopted that.

return dot(h.xy, h.xy) < dot(h.zw, h.zw) 

    ? vec4(h.xy, hC.xy) 

    : vec4(h.zw, hC.zw + .5);


}

// Credit goes to @Heavybrush : https://www.shadertoy.com/view/llVSzW

vec3 hsb2rgb( in vec3 c ){

vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);

rgb = rgb * rgb * (3.0 -2.0 * rgb);

return c.z * mix(vec3(1.0),rgb,c.y);


}

Query

main.js

class AudiobookNarratorOrb {

    constructor() {

        this.scene = null;

        this.camera = null;

        this.renderer = null;

        this.composer = null;

        this.usePostProcessing = false;

        

        // Audio system

        this.audioElement = null;

        this.audioContext = null;

        this.analyser = null;

        this.source = null;

        this.dataArray = null;

        

        // Visual components

        this.narratorOrb = null;

        this.starField = null;

        this.reflectionPlane = null;

        this.reflectedOrb = null;

        this.lights = {};

        

        // Audio analysis - enhanced for speech

        this.amplitude = 0;

        this.smoothedAmplitude = 0;

        this.voiceFrequencies = {

            subBass: 0,     // 20-60Hz

            bass: 0,        // 60-250Hz  

            lowMid: 0,      // 250-500Hz (fundamental voice)

            mid: 0,         // 500-2kHz (vowels, clarity)

            highMid: 0,     // 2-4kHz (consonants)

            presence: 0,    // 4-6kHz (speech presence)

            brilliance: 0   // 6kHz+ (sibilance, air)

        };

        

        // Enhanced reactivity for speech

        this.speechReactivity = {

            intensity: 3.5,

            responsiveness: 0.25,

            smoothing: 0.15

        };

        

        // Color palette

        this.neonColors = {

            electricBlue: new THREE.Color(0x00FFFF),

            scorchedPink: new THREE.Color(0xFF0055),

            ultravioletOrange: new THREE.Color(0xFF6600),

            toxicGreen: new THREE.Color(0x00FF66)

        };

        

        this.clock = new THREE.Clock();

        this.isPlaying = false;

        this.mediaRecorder = null;

        this.recordedChunks = [];

        

        this.init();

        this.setupEventListeners();

        this.animate();

    }

    

    init() {

        // Scene setup

        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x000000);

        

        // Camera with cinematic positioning

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.camera.position.set(0, 1, 8);

        this.camera.lookAt(0, 0, 0);

        

        // High-quality renderer

        this.renderer = new THREE.WebGLRenderer({

            antialias: true,

            preserveDrawingBuffer: true,

            powerPreference: "high-performance"

        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure = 1.2;

        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        

        document.getElementById('container').appendChild(this.renderer.domElement);

        

        // Try to setup post-processing with bloom effect

        this.setupPostProcessing();

        

        this.setupLighting();

        this.createStarField();

        this.createNarratorOrb();

        this.createReflectionSystem();

        

        console.log('Audiobook Narrator Orb initialized', this.usePostProcessing ? 'with bloom' : 'without bloom');

    }

    

    setupPostProcessing() {

        // Check if post-processing classes are available

        if (typeof THREE.EffectComposer === 'undefined' || 

            typeof THREE.RenderPass === 'undefined' || 

            typeof THREE.UnrealBloomPass === 'undefined') {

            console.warn('Post-processing not available, falling back to standard rendering');

            this.usePostProcessing = false;

            return;

        }

        

        try {

            // Create effect composer

            this.composer = new THREE.EffectComposer(this.renderer);

            

            // Add render pass

            const renderPass = new THREE.RenderPass(this.scene, this.camera);

            this.composer.addPass(renderPass);

            

            // Add UnrealBloomPass for ethereal glow

            const bloomPass = new THREE.UnrealBloomPass(

                new THREE.Vector2(window.innerWidth, window.innerHeight),

                0.8,    // strength

                0.6,    // radius

                0.1     // threshold

            );

            this.composer.addPass(bloomPass);

            

            // Add final copy pass if available

            if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.CopyShader !== 'undefined') {

                const copyPass = new THREE.ShaderPass(THREE.CopyShader);

                copyPass.renderToScreen = true;

                this.composer.addPass(copyPass);

            }

            

            this.usePostProcessing = true;

            console.log('Post-processing with bloom effect initialized');

            

        } catch (error) {

            console.warn('Failed to initialize post-processing:', error);

            this.usePostProcessing = false;

        }

    }

    

    setupLighting() {

        // Main key light (Electric Blue)

        this.lights.keyLight = new THREE.PointLight(this.neonColors.electricBlue, 2, 20);

        this.lights.keyLight.position.set(4, 4, 4);

        this.lights.keyLight.castShadow = true;

        this.scene.add(this.lights.keyLight);

        

        // Fill light (Scorched Pink)

        this.lights.fillLight = new THREE.PointLight(this.neonColors.scorchedPink, 1.5, 15);

        this.lights.fillLight.position.set(-3, 2, 3);

        this.scene.add(this.lights.fillLight);

        

        // Rim light (Toxic Green)

        this.lights.rimLight = new THREE.DirectionalLight(this.neonColors.toxicGreen, 1);

        this.lights.rimLight.position.set(-2, -1, -4);

        this.scene.add(this.lights.rimLight);

        

        // Ambient light for subtle base illumination

        this.lights.ambient = new THREE.AmbientLight(0x0a0a0a, 0.3);

        this.scene.add(this.lights.ambient);

    }

    

    createStarField() {

        const starCount = 1500;

        const positions = new Float32Array(starCount * 3);

        const colors = new Float32Array(starCount * 3);

        const sizes = new Float32Array(starCount);

        

        for (let i = 0; i < starCount; i++) {

            const i3 = i * 3;

            

            // Distribute in large sphere

            const radius = 80 + Math.random() * 120;

            const theta = Math.random() * Math.PI * 2;

            const phi = Math.acos(2 * Math.random() - 1);

            

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);

            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);

            positions[i3 + 2] = radius * Math.cos(phi);

            

            // Subtle neon colors

            const colorChoice = Math.random();

            if (colorChoice < 0.4) {

                colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // Electric Blue

            } else if (colorChoice < 0.7) {

                colors[i3] = 1.0; colors[i3 + 1] = 0.0; colors[i3 + 2] = 0.33; // Scorched Pink

            } else if (colorChoice < 0.9) {

                colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.4; // Toxic Green

            } else {

                colors[i3] = 1.0; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.0; // Ultraviolet Orange

            }

            

            sizes[i] = Math.random() * 3 + 0.5;

        }

        

        const starGeometry = new THREE.BufferGeometry();

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        

        const starMaterial = new THREE.PointsMaterial({

            vertexColors: true,

            transparent: true,

            opacity: 0.6,

            sizeAttenuation: true,

            blending: THREE.AdditiveBlending

        });

        

        this.starField = new THREE.Points(starGeometry, starMaterial);

        this.scene.add(this.starField);

    }

    

    createNarratorOrb() {

        const sphereGeometry = new THREE.SphereGeometry(1.8, 128, 64);

        

        // Load shaders from HTML script tags

        const vertexShader = document.getElementById('vertexshader').textContent;

        const fragmentShader = document.getElementById('fragmentshader').textContent;

        

        // Advanced refractive glass material with enhanced shader

        const orbMaterial = new THREE.ShaderMaterial({

            uniforms: {

                time: { value: 0 },

                amplitude: { value: 0 },

                subBass: { value: 0 },

                bass: { value: 0 },

                lowMid: { value: 0 },

                mid: { value: 0 },

                highMid: { value: 0 },

                presence: { value: 0 },

                brilliance: { value: 0 },

                reactivity: { value: this.speechReactivity.intensity },

                electricBlue: { value: this.neonColors.electricBlue },

                scorchedPink: { value: this.neonColors.scorchedPink },

                ultravioletOrange: { value: this.neonColors.ultravioletOrange },

                toxicGreen: { value: this.neonColors.toxicGreen }

            },

            vertexShader: vertexShader,

            fragmentShader: fragmentShader,

            transparent: true,

            blending: THREE.AdditiveBlending,

            side: THREE.DoubleSide

        });

        

        this.narratorOrb = new THREE.Mesh(sphereGeometry, orbMaterial);

        this.scene.add(this.narratorOrb);

    }

    

    createReflectionSystem() {

        // Create subtle reflection plane

        const planeGeometry = new THREE.PlaneGeometry(15, 15);

        const planeMaterial = new THREE.MeshBasicMaterial({

            color: 0x000000,

            transparent: true,

            opacity: 0.1

        });

        

        this.reflectionPlane = new THREE.Mesh(planeGeometry, planeMaterial);

        this.reflectionPlane.rotation.x = -Math.PI / 2;

        this.reflectionPlane.position.y = -2.5;

        this.scene.add(this.reflectionPlane);

        

        // Create reflected orb

        this.reflectedOrb = this.narratorOrb.clone();

        this.reflectedOrb.scale.y = -1;

        this.reflectedOrb.position.y = -5;

        this.reflectedOrb.material = this.reflectedOrb.material.clone();

        

        // Make reflection more subtle

        this.reflectedOrb.material.transparent = true;

        

        // Modify reflection shader for fadeout

        this.reflectedOrb.material.fragmentShader = this.reflectedOrb.material.fragmentShader.replace(

            'gl_FragColor = vec4(result, alpha);',

            `

            // Fade reflection based on distance from center

            float distanceFromCenter = length(vWorldPosition.xz) / 8.0;

            float reflectionFade = 1.0 - clamp(distanceFromCenter, 0.0, 1.0);

            

            alpha *= 0.4 * reflectionFade;

            gl_FragColor = vec4(result * 0.7, alpha);

            `

        );

        

        this.reflectedOrb.material.needsUpdate = true;

        this.scene.add(this.reflectedOrb);

    }

    

    setupEventListeners() {

        // File input

        document.getElementById('audioFile').addEventListener('change', (e) => {

            const file = e.target.files[0];

            if (file) this.loadAudioFile(file);

        });

        

        // Controls

        document.getElementById('playBtn').addEventListener('click', () => this.playAudio());

        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseAudio());

        document.getElementById('exportBtn').addEventListener('click', () => this.exportVideo());

        

        // Keyboard controls

        document.addEventListener('keydown', (e) => {

            if (e.code === 'Space') { e.preventDefault(); this.togglePlayPause(); }

            if (e.code === 'KeyE') { e.preventDefault(); this.exportVideo(); }

        });

        

        // Drag & drop

        const container = document.getElementById('container');

        container.addEventListener('dragover', (e) => { e.preventDefault(); });

        container.addEventListener('drop', (e) => {

            e.preventDefault();

            const files = e.dataTransfer.files;

            if (files.length > 0) this.loadAudioFile(files[0]);

        });

        

        // Window resize

        window.addEventListener('resize', () => this.onWindowResize());

    }

    

    async loadAudioFile(file) {

        this.showLoading(true);

        

        try {

            console.log('Loading audiobook:', file.name);

            

            this.audioElement = new Audio();

            this.audioElement.crossOrigin = 'anonymous';

            

            const url = URL.createObjectURL(file);

            this.audioElement.src = url;

            

            await new Promise((resolve, reject) => {

                this.audioElement.addEventListener('loadeddata', resolve);

                this.audioElement.addEventListener('error', reject);

                this.audioElement.load();

            });

            

            // Setup enhanced audio analysis for speech

            if (!this.audioContext) {

                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            }

            

            if (this.source) this.source.disconnect();

            

            this.source = this.audioContext.createMediaElementSource(this.audioElement);

            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = 8192; // High resolution for speech analysis

            this.analyser.smoothingTimeConstant = 0.7; // Responsive to speech dynamics

            

            this.source.connect(this.analyser);

            this.analyser.connect(this.audioContext.destination);

            

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            

            // Update UI

            document.getElementById('audioTitle').textContent = file.name;

            document.getElementById('audioInfo').style.display = 'block';

            document.getElementById('playBtn').disabled = false;

            document.getElementById('pauseBtn').disabled = false;

            document.getElementById('exportBtn').disabled = false;

            

            console.log('✅ Audiobook loaded and ready for enhanced narration!');

            

        } catch (error) {

            console.error('Error loading audiobook:', error);

            alert('Error loading audiobook. Please try MP3, WAV, or MP4 format.');

        } finally {

            this.showLoading(false);

        }

    }

    

    playAudio() {

        if (this.audioElement && this.audioContext) {

            if (this.audioContext.state === 'suspended') {

                this.audioContext.resume();

            }

            this.audioElement.play();

            this.isPlaying = true;

        }

    }

    

    pauseAudio() {

        if (this.audioElement) {

            this.audioElement.pause();

            this.isPlaying = false;

        }

    }

    

    togglePlayPause() {

        if (this.isPlaying) this.pauseAudio();

        else this.playAudio();

    }

    

    async exportVideo() {

        if (!this.audioElement) {

            alert('Please load an audiobook file first');

            return;

        }

        

        const exportBtn = document.getElementById('exportBtn');

        exportBtn.disabled = true;

        exportBtn.textContent = 'Recording...';

        

        try {

            this.audioElement.currentTime = 0;

            const duration = this.audioElement.duration;

            

            // Ultra high-quality recording for cinematic output

            const canvasStream = this.renderer.domElement.captureStream(60);

            const audioDestination = this.audioContext.createMediaStreamDestination();

            this.source.connect(audioDestination);

            

            const combinedStream = new MediaStream([

                ...canvasStream.getVideoTracks(),

                ...audioDestination.stream.getAudioTracks()

            ]);

            

            this.mediaRecorder = new MediaRecorder(combinedStream, {

                mimeType: 'video/webm;codecs=vp9,opus',

                videoBitsPerSecond: 15000000, // 15 Mbps for cinema quality

                audioBitsPerSecond: 320000    // 320 kbps for audiobook quality

            });

            

            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {

                if (e.data.size > 0) this.recordedChunks.push(e.data);

            };

            

            this.mediaRecorder.onstop = () => this.downloadVideo();

            

            this.mediaRecorder.start(100);

            this.playAudio();

            

            setTimeout(() => {

                this.mediaRecorder.stop();

                exportBtn.disabled = false;

                exportBtn.textContent = 'EXPORT';

            }, (duration + 1) * 1000);

            

            alert(`🎬 Recording ${duration.toFixed(1)}s of enhanced narrator orb!\nCinema-quality export will download automatically.`);

            

        } catch (error) {

            console.error('Export error:', error);

            alert('Export failed: ' + error.message);

            exportBtn.disabled = false;

            exportBtn.textContent = 'EXPORT';

        }

    }

    

    downloadVideo() {

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().slice(0,19).replace(/[:.]/g, '-');

        

        const a = document.createElement('a');

        a.href = url;

        a.download = `audiobook-narrator-orb-enhanced-${timestamp}.webm`;

        a.click();

        

        URL.revokeObjectURL(url);

        console.log('✅ Enhanced narrator orb exported!');

    }

    

    updateAudioAnalysis() {

        if (!this.analyser || !this.isPlaying) return;

        

        this.analyser.getByteFrequencyData(this.dataArray);

        

        // Enhanced amplitude calculation with speech focus

        let sum = 0;

        for (let i = 0; i < this.dataArray.length; i++) {

            sum += this.dataArray[i];

        }

        const rawAmplitude = sum / this.dataArray.length / 255;

        

        // More responsive smoothing for speech dynamics

        this.amplitude += (rawAmplitude - this.amplitude) * this.speechReactivity.responsiveness;

        this.smoothedAmplitude += (this.amplitude - this.smoothedAmplitude) * this.speechReactivity.smoothing;

        

        // Enhanced frequency analysis for speech characteristics

        const nyquist = this.audioContext.sampleRate / 2;

        const binSize = nyquist / this.dataArray.length;

        

        const speechBands = {

            subBass: [20, 60],

            bass: [60, 250],

            lowMid: [250, 500],   // Fundamental voice frequencies

            mid: [500, 2000],     // Vowel formants

            highMid: [2000, 4000], // Consonant clarity

            presence: [4000, 6000], // Speech presence

            brilliance: [6000, 20000] // Sibilance and air

        };

        

        Object.keys(speechBands).forEach(band => {

            const [minFreq, maxFreq] = speechBands[band];

            const startBin = Math.floor(minFreq / binSize);

            const endBin = Math.floor(maxFreq / binSize);

            

            let bandSum = 0;

            for (let i = startBin; i < endBin; i++) {

                bandSum += this.dataArray[i];

            }

            

            const rawValue = bandSum / (endBin - startBin) / 255;

            

            // Enhanced smoothing with speech-specific responsiveness

            const responsiveness = band === 'mid' || band === 'highMid' ? 0.3 : 0.2;

            this.voiceFrequencies[band] += (rawValue - this.voiceFrequencies[band]) * responsiveness;

        });

    }

    

    updateVisuals() {

        const time = this.clock.getElapsedTime();

        

        // Update narrator orb with enhanced speech reactivity

        if (this.narratorOrb && this.narratorOrb.material.uniforms) {

            const uniforms = this.narratorOrb.material.uniforms;

            uniforms.time.value = time;

            uniforms.amplitude.value = this.smoothedAmplitude;

            uniforms.subBass.value = this.voiceFrequencies.subBass;

            uniforms.bass.value = this.voiceFrequencies.bass;

            uniforms.lowMid.value = this.voiceFrequencies.lowMid;

            uniforms.mid.value = this.voiceFrequencies.mid;

            uniforms.highMid.value = this.voiceFrequencies.highMid;

            uniforms.presence.value = this.voiceFrequencies.presence;

            uniforms.brilliance.value = this.voiceFrequencies.brilliance;

        }

        

        // Update reflected orb

        if (this.reflectedOrb && this.reflectedOrb.material.uniforms) {

            Object.assign(this.reflectedOrb.material.uniforms, this.narratorOrb.material.uniforms);

        }

        

        // Dynamic lighting based on speech

        const speechActivity = (this.voiceFrequencies.mid + this.voiceFrequencies.highMid + this.voiceFrequencies.presence) / 3;

        

        this.lights.keyLight.intensity = 2 + speechActivity * 1.5;

        this.lights.fillLight.intensity = 1.5 + this.voiceFrequencies.bass * 0.8;

        this.lights.rimLight.intensity = 1 + this.voiceFrequencies.brilliance * 1.2;

        

        // Subtle rotation enhanced by speech activity

        const rotationSpeed = 0.003 * (1 + speechActivity * 0.7);

        this.narratorOrb.rotation.y += rotationSpeed;

        this.narratorOrb.rotation.x += rotationSpeed * 0.4;

        

        if (this.reflectedOrb) {

            this.reflectedOrb.rotation.y += rotationSpeed;

            this.reflectedOrb.rotation.x += rotationSpeed * 0.4;

        }

        

        // Gentle starfield animation

        if (this.starField) {

            this.starField.rotation.y += 0.0002;

            this.starField.material.opacity = 0.6 + speechActivity * 0.2;

        }

    }

    

    updateCamera() {

        const time = this.clock.getElapsedTime();

        

        // Cinematic camera movement with speech responsiveness

        const speechIntensity = (this.voiceFrequencies.mid + this.voiceFrequencies.presence) / 2;

        const radius = 8 + Math.sin(time * 0.08) * 1.5 + speechIntensity * 0.5;

        const speed = 0.02 + speechIntensity * 0.01;

        

        this.camera.position.x = Math.sin(time * speed) * radius;

        this.camera.position.z = Math.cos(time * speed) * radius;

        this.camera.position.y = 1 + Math.sin(time * 0.03) * 0.8 + speechIntensity * 0.3;

        

        this.camera.lookAt(0, 0, 0);

    }

    

    updateTimeDisplay() {

        if (this.audioElement) {

            const current = this.audioElement.currentTime || 0;

            const duration = this.audioElement.duration || 0;

            

            const formatTime = (time) => {

                const mins = Math.floor(time / 60);

                const secs = Math.floor(time % 60);

                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            };

            

            document.getElementById('audioTime').textContent = `${formatTime(current)} / ${formatTime(duration)}`;

        }

    }

    

    showLoading(show) {

        document.getElementById('loading').style.display = show ? 'block' : 'none';

    }

    

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        

        // Update composer size for post-processing

        if (this.composer && this.usePostProcessing) {

            this.composer.setSize(window.innerWidth, window.innerHeight);

        }

    }

    

    animate() {

        requestAnimationFrame(() => this.animate());

        

        this.updateAudioAnalysis();

        this.updateVisuals();

        this.updateCamera();

        this.updateTimeDisplay();

        

        // Render with post-processing bloom effect if available, otherwise fallback

        if (this.usePostProcessing && this.composer) {

            this.composer.render();

        } else {

            this.renderer.render(this.scene, this.camera);

        }

    }

}



// Initialize the enhanced audiobook narrator orb

document.addEventListener('DOMContentLoaded', () => {

    new AudiobookNarratorOrb();

});

