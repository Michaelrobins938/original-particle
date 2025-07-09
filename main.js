class AudiobookNarratorOrb {
    constructor() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            this.showError('Three.js library failed to load. Please refresh the page.');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
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
        this.isInitialized = false;
        
        try {
            this.init();
            this.setupEventListeners();
            this.animate();
            this.isInitialized = true;
            console.log('✅ Audiobook Narrator Orb initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize 3D graphics. Please check your browser compatibility.');
        }
    }
    
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        console.error(message);
        
        // Hide success message if showing
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.style.display = 'none';
        }
    }
    
    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
        console.log(message);
        
        // Hide error message if showing
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            if (successElement) {
                successElement.style.display = 'none';
            }
        }, 3000);
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Camera with cinematic positioning
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 8);
        this.camera.lookAt(0, 0, 0);
        
        // High-quality renderer with better error handling
        try {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true,
                powerPreference: "high-performance"
            });
        } catch (error) {
            console.warn('High-performance WebGL failed, falling back to default:', error);
            try {
                this.renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    preserveDrawingBuffer: true
                });
            } catch (fallbackError) {
                console.error('WebGL initialization failed:', fallbackError);
                throw new Error('WebGL is not supported on this device');
            }
        }
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Check for WebGL2 support and set encoding accordingly
        if (this.renderer.capabilities.isWebGL2) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
        } else {
            console.warn('WebGL2 not available, using basic rendering');
        }
        
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        this.setupLighting();
        this.createStarField();
        this.createNarratorOrb();
        this.createReflectionSystem();
    }
    
    setupLighting() {
        // Main key light (Electric Blue)
        this.lights.keyLight = new THREE.PointLight(this.neonColors.electricBlue, 2, 20);
        this.lights.keyLight.position.set(4, 4, 4);
        this.lights.keyLight.castShadow = true;
        this.lights.keyLight.shadow.mapSize.width = 1024;
        this.lights.keyLight.shadow.mapSize.height = 1024;
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
        
        // Advanced refractive glass material with custom shader
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
            vertexShader: `
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
                
                // Enhanced noise for organic speech-like movement
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
                    float timeSpeed = time * 1.2;
                    
                    // Speech-reactive displacement layers
                    // Low frequencies create large organic movements
                    float speechBase = snoise(pos * 1.8 + vec3(timeSpeed * 0.4, 0.0, 0.0)) * (bass + lowMid) * 0.25 * reactivity;
                    
                    // Mid frequencies for vowel articulation
                    float vowelFormation = snoise(pos * 3.5 + vec3(0.0, timeSpeed * 0.8, timeSpeed * 0.6)) * mid * 0.2 * reactivity;
                    
                    // High frequencies for consonant precision
                    float consonantDetail = snoise(pos * 8.0 + vec3(timeSpeed * 1.5, 0.0, timeSpeed * 1.2)) * (highMid + presence) * 0.15 * reactivity;
                    
                    // Sibilance and breath sounds
                    float breathDetail = snoise(pos * 15.0 + vec3(timeSpeed * 2.0, timeSpeed * 1.8, 0.0)) * brilliance * 0.1 * reactivity;
                    
                    // Global speech activity
                    float speechIntensity = (bass + lowMid + mid + highMid + presence) * 0.2;
                    vSpeechActivity = speechIntensity;
                    
                    // Pulsation based on overall amplitude
                    float globalPulse = 1.0 + amplitude * 0.3 * reactivity;
                    
                    // Combine all speech-reactive layers
                    float totalDisplacement = speechBase + vowelFormation + consonantDetail + breathDetail;
                    vDisplacement = totalDisplacement;
                    
                    // Apply displacement along normal
                    vec3 displaced = pos + normal * totalDisplacement;
                    displaced *= globalPulse;
                    
                    vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
                    
                    // Enhanced fresnel for refractive glass look
                    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
                    vec3 worldNormal = normalize(normalMatrix * normal);
                    vec3 viewDirection = normalize(cameraPosition - worldPosition.xyz);
                    vFresnelFactor = pow(1.0 - abs(dot(viewDirection, worldNormal)), 2.0);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
                }
            `,
            fragmentShader: `
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
                    
                    // Base glass color
                    vec3 glassBase = mix(electricBlue, scorchedPink, colorCycle);
                    
                    // Speech-reactive color layers
                    vec3 midColor = mix(glassBase, ultravioletOrange, mid * 0.7);
                    vec3 finalColor = mix(midColor, toxicGreen, (highMid + presence) * 0.5);
                    
                    // Internal energy patterns
                    float internalEnergy = abs(vDisplacement) * 3.0 + vSpeechActivity;
                    
                    // Speech interference patterns
                    float speechPattern = sin(vPosition.x * 20.0 + time * 4.0) * 
                                        cos(vPosition.y * 15.0 + time * 3.0) * 
                                        sin(vPosition.z * 25.0 + time * 5.0) * 
                                        vSpeechActivity * 0.4;
                    
                    // Rim lighting for refractive glass effect
                    float rimIntensity = vFresnelFactor * 2.5;
                    
                    // Combine all lighting effects
                    vec3 result = finalColor * (0.6 + internalEnergy + rimIntensity + abs(speechPattern));
                    
                    // Dynamic transparency based on speech activity
                    float alpha = 0.25 + rimIntensity * 0.5 + vSpeechActivity * 0.3;
                    alpha += abs(speechPattern) * 0.2;
                    alpha = clamp(alpha, 0.2, 0.9);
                    
                    gl_FragColor = vec4(result, alpha);
                }
            `,
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
            if (e.code === 'Space') { 
                e.preventDefault(); 
                this.togglePlayPause(); 
            }
            if (e.code === 'KeyE') { 
                e.preventDefault(); 
                this.exportVideo(); 
            }
        });
        
        // Enhanced drag & drop
        const container = document.getElementById('container');
        const dropZone = document.getElementById('dropZone');
        
        container.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            dropZone.classList.add('active');
        });
        
        container.addEventListener('dragleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                dropZone.classList.remove('active');
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('active');
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
            
            // Validate file type
            const validTypes = ['audio/', 'video/'];
            if (!validTypes.some(type => file.type.startsWith(type))) {
                throw new Error('Please select an audio or video file');
            }
            
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            
            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            
            await new Promise((resolve, reject) => {
                this.audioElement.addEventListener('loadeddata', resolve);
                this.audioElement.addEventListener('error', (e) => {
                    reject(new Error('Failed to load audio file'));
                });
                this.audioElement.load();
            });
            
            // Setup enhanced audio analysis for speech
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
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
            
            // Show success message
            this.showSuccess(`✅ Audiobook "${file.name}" loaded successfully!`);
            
            console.log('✅ Audiobook loaded and ready for narration!');
            
            // Clean up object URL
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error loading audiobook:', error);
            this.showError(`Error loading audiobook: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }
    
    async playAudio() {
        if (this.audioElement && this.audioContext) {
            try {
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                await this.audioElement.play();
                this.isPlaying = true;
                this.showSuccess('🎵 Playback started');
            } catch (error) {
                console.error('Audio play error:', error);
                this.showError('Failed to play audio. Please try again.');
            }
        }
    }
    
    pauseAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.showSuccess('⏸ Playback paused');
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }
    
    async exportVideo() {
        if (!this.audioElement) {
            this.showError('Please load an audiobook file first');
            return;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.disabled = true;
        exportBtn.textContent = '🎬 Recording...';
        
        try {
            this.audioElement.currentTime = 0;
            const duration = this.audioElement.duration;
            
            // Check MediaRecorder support
            let mimeType;
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                mimeType = 'video/webm;codecs=vp9,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                mimeType = 'video/webm;codecs=vp8,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            } else {
                throw new Error('Video recording not supported on this browser');
            }
            
            // High-quality recording
            const canvasStream = this.renderer.domElement.captureStream(60);
            const audioDestination = this.audioContext.createMediaStreamDestination();
            this.source.connect(audioDestination);
            
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioDestination.stream.getAudioTracks()
            ]);
            
            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 8000000, // 8 Mbps for good quality
                audioBitsPerSecond: 320000   // 320 kbps for audiobook quality
            });
            
            this.recordedChunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordedChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => this.downloadVideo();
            
            this.mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                this.showError('Recording failed: ' + e.error);
                exportBtn.disabled = false;
                exportBtn.textContent = '🎬 EXPORT';
            };
            
            this.mediaRecorder.start(100);
            await this.playAudio();
            
            this.showSuccess(`🎬 Recording ${duration.toFixed(1)}s of cinematic narrator orb!`);
            
            setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                }
                exportBtn.disabled = false;
                exportBtn.textContent = '🎬 EXPORT';
            }, (duration + 1) * 1000);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError(`Export failed: ${error.message}`);
            exportBtn.disabled = false;
            exportBtn.textContent = '🎬 EXPORT';
        }
    }
    
    downloadVideo() {
        try {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().slice(0,19).replace(/[:.]/g, '-');
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `audiobook-narrator-orb-${timestamp}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showSuccess('✅ Cinematic narrator orb exported successfully!');
            console.log('✅ Cinematic narrator orb exported!');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Failed to download video: ' + error.message);
        }
    }
    
    updateAudioAnalysis() {
        if (!this.analyser || !this.isPlaying || !this.dataArray) return;
        
        try {
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
                const endBin = Math.min(Math.floor(maxFreq / binSize), this.dataArray.length - 1);
                
                let bandSum = 0;
                let binCount = 0;
                for (let i = startBin; i <= endBin; i++) {
                    bandSum += this.dataArray[i];
                    binCount++;
                }
                
                const rawValue = binCount > 0 ? bandSum / binCount / 255 : 0;
                
                // Enhanced smoothing with speech-specific responsiveness
                const responsiveness = band === 'mid' || band === 'highMid' ? 0.3 : 0.2;
                this.voiceFrequencies[band] += (rawValue - this.voiceFrequencies[band]) * responsiveness;
            });
        } catch (error) {
            console.warn('Audio analysis error:', error);
        }
    }
    
    updateVisuals() {
        if (!this.isInitialized) return;
        
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
        
        if (this.lights.keyLight) {
            this.lights.keyLight.intensity = 2 + speechActivity * 1.5;
        }
        if (this.lights.fillLight) {
            this.lights.fillLight.intensity = 1.5 + this.voiceFrequencies.bass * 0.8;
        }
        if (this.lights.rimLight) {
            this.lights.rimLight.intensity = 1 + this.voiceFrequencies.brilliance * 1.2;
        }
        
        // Subtle rotation enhanced by speech activity
        const rotationSpeed = 0.003 * (1 + speechActivity * 0.7);
        
        if (this.narratorOrb) {
            this.narratorOrb.rotation.y += rotationSpeed;
            this.narratorOrb.rotation.x += rotationSpeed * 0.4;
        }
        
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
        if (!this.isInitialized) return;
        
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
            
            const timeDisplay = document.getElementById('audioTime');
            if (timeDisplay) {
                timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
            }
        }
    }
    
    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        try {
            this.updateAudioAnalysis();
            this.updateVisuals();
            this.updateCamera();
            this.updateTimeDisplay();
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.error('Animation loop error:', error);
        }
    }
}

// Initialize the audiobook narrator orb when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AudiobookNarratorOrb();
    } catch (error) {
        console.error('Failed to initialize Audiobook Narrator Orb:', error);
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'Failed to initialize application. Please refresh the page and check browser compatibility.';
        }
    }
});
