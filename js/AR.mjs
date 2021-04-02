import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { TubePainter } from 'https://unpkg.com/three@0.126.1/examples/jsm/misc/TubePainter.js';
import { ARButton } from './ARButton.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
//import * as HTML from '../node_modules/html2canvas/dist/html2canvas.min.js';
import { MTLLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

import { EXRLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/EXRLoader.js';

const html = `<div id="controls">
<button id="button-reset" alt="Draw"></body>
<!-- <button id="button-action" alt="Toggle Flash"></button> -->
<button id="button-mode-toggle" alt="Toggle mode" class="dynamic">
    <span class='static-mode'></span>
    <span class='dynamic-mode'></span>
</button>
<button id="button-close" alt="Close"></button>
</div>
<div id="menus">
<div id="trails_menu">
    <div style="min-width: 200px; height: 50px; flex: 1 0 auto;"></div>
    <img class="small-x-button" src="./assets/small-x.svg" alt="Exit Trail">
    <div style="min-width: 200px; height: 50px; flex: 1 0 auto;"></div>
</div>

<div id="aircrafts_menu">
    <div style="width: 200px; flex: 1 0 auto;"></div>
    <div style="min-width: 200px; height: 50px; flex: 1 0 auto;"></div>
</div>

<div id="settings_menu">
    <div style="width: 40px;"></div>
    <div class="mode-menu">
        <div>GIF</div>
        <div class="selected">תמונה</div>
        <div>סרטון</div>
    </div>
    <img class="flip-camera" src="./assets/flip-camera.svg" alt="Flip Camera">
</div>
</div>
<!-- <div class="USDZ-container">
<a rel="ar" href="https://developer.apple.com/augmented-reality/quick-look/models/biplane/toy_biplane.usdz"><img class="image-model" src="https://developer.apple.com/augmented-reality/quick-look/models/biplane/biplane_2x.jpg" alt="" data-hires-status="replaced"></a>
</div> -->`;

var elem = document.createElement('div');
elem.id = "ar-overly";
elem.innerHTML = html;
document.body.append(elem);

setTimeout(() => {


    let container;
    let camera, controls, scene, renderer;
    let controller, painter, aircraft;
    let animationCycleStart = new Date();
    let trails = [];
    let planeMesh;
    let pngCubeRenderTarget, exrCubeRenderTarget;
    let pngBackground, exrBackground;
    const cursor = new THREE.Vector3();

    const params = {
        envMap: 'EXR',
        roughness: 0.0,
        metalness: 0.0,
        exposure: 1.5,
        debug: false,
    };

    let locations = [
        // top triangle
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [1, 0],
        [-1, 0],
        [0, Math.sqrt(3)],
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        //bottom
        [1, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [0, -Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [-1, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        //[1, 0],
    ];
    locations = locations.map(([x, y]) => [0, y / 10 - 0.1, -x / 10]);
    locations = addMidpoints(locations, 20);

    const AIRCRAFTS_META_DATA = [
        { id: "f15", type: "obj", scale: 0.007, text: "f15" },
        { id: "f35", type: "glb", scale: 0.1, text: "f35" },
        { id: "kfir", type: "glb", scale: 0.005, text: "kfir" },
        { id: "yasur", type: "glb", scale: 0.000007, text: "yasur" },
        { id: "f16", type: "gltf", scale: 0.005, text: "f16" },
        { id: "efroni", type: "glb", scale: 0.000007, text: "efroni" },
        // { id: "aero", type: "glb", scale: 0.005, text: "aero" },
        // { id: "rafael", type: "gltf", scale: 0.005, text: "f99" }
    ];

    const TRAILS_META_DATA = [
        // { id: "gold", type: "obj", scale: 0.0001, text: "gold" },
        // { id: "ghost", type: "obj", scale: 0.003, text: "ghost" },
        // { id: "rainbow", type: "glb", scale: 0.03, text: "Personified Rainbow" },
        // { id: "moustache", type: "glb", scale: 0.05, text: "moustache" },
        // { id: "crown", type: "glb", scale: 0.01, text: "crown" },
        // { id: "cloud", type: "glb", scale: 0.12, text: "cloud" },
        { id: "heart", type: "glb", scale: 0.005, text: "Red heart" },
        { id: "blue", type: "obj", scale: 0.0001, text: "david" },
        // { id: "cheeseburger", type: "glb", scale: 0.07, text: "cheeseburger" },
        // { id: "happyface", type: "glb", scale: 0.5, text: "Happy Face" },
        { id: "love", type: "glb", scale: 0.5, text: "Heart Eyes Face" },
        // { id: "poo", type: "glb", scale: 0.5, text: "poo" },
        { id: "star", type: "glb", scale: 0.05, text: "star" },
        { id: "doughnut", type: "glb", scale: 0.09, text: "doughnut" },
        // { id: "disco", type: "glb", scale: 0.009, text: "Disco Ball" },
        { id: "beachball", type: "glb", scale: 0.25, text: "Beach Ball" },
        // { id: "basketball", type: "glb", scale: 0.025, text: "Basketball" },
        // { id: "cake", type: "glb", scale: 0.04, text: "cake" },
        // { id: "present", type: "glb", scale: 0.09, text: "present" },
    ];
    
    init();
    animate();

    let mode = 'dynamic';

    function init() {

        // Detect filter change
        let isAircraftScrolling = setTimeout(() => { }, 0);
        document.getElementById('aircrafts_menu').onscroll = () => {
            clearInterval(isAircraftScrolling);
            isAircraftScrolling = setTimeout(() => {
                const centeredElement = document.elementFromPoint(
                    document.body.offsetWidth / 2, document.body.offsetHeight + 710
                );
                let selected = centeredElement.parentElement.innerHTML.match(`(?<=assets\/)(.*)(?=\.png)`)[0];
                AIRCRAFTS_META_DATA.forEach((e) => {
                    if (e.id === selected)
                        changeAircraft(e);
                });
            }, 100);
        };

        document.getElementById('controls').addEventListener('beforexrselect', ev => ev.preventDefault());
        document.getElementById('menus').addEventListener('beforexrselect', ev => ev.preventDefault());

        AIRCRAFTS_META_DATA.forEach(aircraft => {
            const elem = document.createElement('button');
            elem.classList.add("aircraft-option");
            elem.type = "button";
            elem.id = aircraft.id;
            elem.innerHTML = `<img src="./assets/${aircraft.text}.png"/>`;
            document.getElementById('aircrafts_menu').insertBefore(elem, document.getElementById('aircrafts_menu').children[1]);

        });

        TRAILS_META_DATA.forEach(trail => {
            const elem = document.createElement('button');
            elem.classList.add("trails-option");
            elem.type = "button";
            elem.id = trail.id;
            elem.innerHTML = `<img id="${trail.text}" src="./assets/${trail.text}.png">`;
            document.getElementById('trails_menu').insertBefore(elem, document.getElementById('trails_menu').children[2]);
            elem.addEventListener('click', () => {
                changeTrails(trail);
            });
        });

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        camera.position.set(.2, .06, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;

        // environment
        let material = new THREE.MeshStandardMaterial({
            metalness: params.roughness,
            roughness: params.metalness,
            envMapIntensity: 1.0
        });

        let geometry = new THREE.PlaneGeometry(200, 200);

        material = new THREE.MeshBasicMaterial();

        planeMesh = new THREE.Mesh(geometry, material);
        planeMesh.position.y = -50;
        planeMesh.rotation.x = -Math.PI * 0.5;
        scene.add(planeMesh);

        THREE.DefaultLoadingManager.onLoad = function () {

            pmremGenerator.dispose();

        };

        new EXRLoader()
            .setDataType(THREE.UnsignedByteType)
            .load('assets/textures/compressed.exr', function (texture) {

                exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                exrBackground = exrCubeRenderTarget.texture;

                texture.dispose();

            });

        new THREE.TextureLoader().load('assets/textures/equirectangular.png', function (texture) {

            texture.encoding = THREE.sRGBEncoding;

            pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

            pngBackground = pngCubeRenderTarget.texture;

            texture.dispose();

        });

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.listenToKeyEvents(window); // optionalz

        container = document.createElement('div');
        document.body.appendChild(container);
        container.appendChild(renderer.domElement);

        const arButton = ARButton.createButton(renderer, {
            optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
            domOverlay: { root: document.getElementById("ar-overly") },
            endSessionCallback: startup
        });

        document.getElementById("aircraftInfo3D").appendChild(arButton);
        
        window.addEventListener('load', startup, false);
        var streaming = false;

        var video = null;

        // function startup() {
        // 	video = document.getElementById('video');
        // 	navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia);
        // 	navigator.getUserMedia({ video: true, audio: false })
        // 		.then(function (stream) {
        // 			video.srcObject = stream;
        // 			video.play();
        // 			arButton.addEventListener('click', () => {
        // 				stream.getTracks().forEach(function(track) {
        // 					track.stop();
        // 				});
        function startup() {
            video = document.getElementById('video');
            const getUserMedia = (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
            getUserMedia({ video: true, audio: false })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();
                    arButton.addEventListener('click', () => {
                        stream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    });
                })
                .catch(function (err) {
                    console.log("An error occurred: " + err);
                });
            video.addEventListener('canplay', function (ev) {
                let width = window.screen.width;
                if (!streaming) {
                    let height = video.videoHeight / (video.videoWidth / width);
                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    streaming = true;
                }
            }, false);
        }
        // model
        /*document.getElementById("button-action").addEventListener("click", (e) => {
            takeScreenshot();
        })*/
        document.getElementById("button-reset").addEventListener("click", (e) => {
            resetScene();
        });

        document.getElementById("button-close").addEventListener("click", (e) => {
            resetScene();
        });
        document.getElementById('button-mode-toggle').addEventListener("click", function () {
            if (mode == 'static') {
                mode = 'dynamic';
                this.classList.add('dynamic');
                this.classList.remove('static');
                if (locations.length)
                    locations.pop();
                painter.mesh.material.opacity = 0.3;
            } else {
                mode = 'static';
                this.classList.add('static');
                this.classList.remove('dynamic');
                locations.push([cursor.x, cursor.y, cursor.z]);
                painter.mesh.material.opacity = 0;
                trails.forEach(trail => trail.children[0].children[0].material.opacity = 0);
                trails.forEach(trail => trail.children[0].children[0].material.transparent = true);
            }
        });

        changeAircraft(AIRCRAFTS_META_DATA[0]);
        loadLight();
        loadPainter();
        loadController();
        changeTrails(TRAILS_META_DATA[0]);

        window.addEventListener('resize', onWindowResize);
    }

    function createVidBackgrounds() {
        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let videos = document.querySelectorAll('video');
        let w, h;
        for (let i = 0, len = videos.length; i < len; i++) {
            const v = videos[i];
            //debugger
            //if (!v.src) continue // no video here
            try {
                w = v.videoWidth;
                h = v.videoHeight;
                canvas.width = w;
                canvas.height = h;
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(v, 0, 0, w, h);
                document.body.style.backgroundImage = `url(${canvas.toDataURL()})`; // here is the magic
                document.body.style.backgroundSize = 'cover';
                ctx.clearRect(0, 0, w, h); // clean the canvas
            } catch (e) {
                continue;
            }
        }
    }

    window.setInterval(createVidBackgrounds, 30);

    function takeScreenshot() {
        const canvas = document.getElementsByTagName('canvas')[0];
        createVidBackgrounds();
        html2canvas(document.querySelector("body")).then(canvas => {
            var base64image = canvas.toDataURL("image/png");
            var iframe = "<img src='" + base64image + "'>";
            var x = window.open();
            x.document.open();
            x.document.write(iframe);
            x.document.close();
        });
    }

    function resetScene() {
        locations = [];
        scene.remove(painter.mesh);
        loadPainter();
    }

    function loadController() {
        function onSelectStart(event) {
            event.inputSource;

            this.userData.isSelecting = true;
            this.userData.skipFrames = 2;
            document.body.classList.add('is-selecting');
        }

        function onSelectEnd() {
            this.userData.isSelecting = false;
            document.body.classList.remove('is-selecting');
        }

        function beforeXRSelect(e) {
            e.preventDefault();
        }

        controller = renderer.xr.getController(0);
        controller.addEventListener('selectstart', onSelectStart);
        controller.addEventListener('selectend', onSelectEnd);
        controller.addEventListener('beforexrselect', beforeXRSelect);
        controller.userData.skipFrames = 0;
        scene.add(controller);
    }


    function loadAircraftGLTF(selectedAircraft) {
        new GLTFLoader()
            .load('./3d_models/aircrafts/gltf/' + selectedAircraft.id + '/object.' + selectedAircraft.type, function (gltf) {
                if (aircraft)
                    scene.remove(aircraft);
                aircraft = gltf.scene;
                const scale = selectedAircraft.scale;
                aircraft.scale.set(scale, scale, scale);
                scene.add(aircraft);
            }, undefined, function (error) {
                console.error(error);
            });
    }

    function loadAircraftOBJ(selectedAircraft) {
        new MTLLoader()
            .setPath('./3d_models/aircrafts/obj/' + selectedAircraft.id + '/')
            .load('object.mtl', function (materials) {
                materials.preload();
                new OBJLoader()
                    .setMaterials(materials)
                    .setPath('./3d_models/aircrafts/obj/' + selectedAircraft.id + '/')
                    .load('object.obj', function (object) {
                        if (aircraft)
                            scene.remove(aircraft);
                        aircraft = object;
                        const scale = selectedAircraft.scale;
                        aircraft.scale.set(scale, scale, scale);
                        scene.add(aircraft);
                    }, undefined, function (error) {
                        console.error(error);
                    });
            });
    }

    function loadPainter() {
        painter = new TubePainter();
        painter.setSize(0.1);
        painter.mesh.material.transparent = true;
        painter.mesh.material.opacity = 0.3;
        painter.mesh.material.side = THREE.DoubleSide;
        painter.moveTo(locations[0] || [0, 0, 0]);
        for (let location of locations)
            painter.lineTo({
                x: location[0],
                y: location[1],
                z: location[2]
            });
        painter.update();

        scene.add(painter.mesh);
    }

    function loadAircraft(selectedAircraft) {
        if (selectedAircraft.type == "gltf" || selectedAircraft.type == "glb") {
            loadAircraftGLTF(selectedAircraft);
        } else if (selectedAircraft.type == "obj") {
            loadAircraftOBJ(selectedAircraft);
        }
    }

    function loadTrails(selectedTrails) {
        if (selectedTrails.type == "gltf" || selectedTrails.type == "glb") {
            loadTrailsGLTF(selectedTrails);
        } else if (selectedTrails.type == "obj") {
            loadTrailsOBJ(selectedTrails);
        }
    }

    function loadTrailsGLTF(selectedTrails) {
        for (let i = 0; i < 7; i++) {
            new GLTFLoader()
                .load('./3d_models/trails/gltf/' + selectedTrails.id + '/object.' + selectedTrails.type, function (gltf) {
                    const trail = gltf.scene;
                    let scale = (selectedTrails.scale * Math.abs((1 - ((i + 1) / 10)) % 1));
                    // let scale = (selectedTrails.scale);
                    if (i == 0) {
                        scale = scale / 2;
                    }
                    // const scale = selectedTrails.scale;
                    trail.scale.set(scale, scale, scale);
                    scene.add(trail);
                    trails.push(trail);
                }, undefined, function (error) {
                    console.error(error);
                });
        }
    }

    function loadTrailsOBJ(selectedTrails) {
        for (let i = 0; i < 9; i++) {
            new MTLLoader()
                .setPath('./3d_models/trails/obj/' + selectedTrails.id + '/')
                .load('object.mtl', function (materials) {
                    materials.preload();
                    new OBJLoader()
                        .setMaterials(materials)
                        .setPath('./3d_models/trails/obj/' + selectedTrails.id + '/')
                        .load('object.obj', function (object) {
                            const trail = object;
                            // const num = ((1 - (i / 10)) % 1) / 10000
                            const scale = (selectedTrails.scale * Math.abs((1 - ((i + 1) / 10)) % 1));
                            // const scale = selectedTrails.scale;
                            trail.scale.set(scale, scale, scale);
                            scene.add(trail);
                            trails.push(trail);
                        }, undefined, function (error) {
                            console.error(error);
                        });
                });
        }
    }

    function changeAircraft(selectedAircraft) {
        AIRCRAFTS_META_DATA.forEach(option => { document.getElementById(option.id).classList.remove("selected"); });
        document.getElementById(selectedAircraft.id).classList.add("selected");
        loadAircraft(selectedAircraft);
    }

    function changeTrails(selectedTrails) {
        TRAILS_META_DATA.forEach(option => { document.getElementById(option.id).classList.remove("selected"); });
        document.getElementById(selectedTrails.id).classList.add("selected");
        scene.remove(trails);
        trails.forEach(trail => { scene.remove(trail); });
        trails = [];
        loadTrails(selectedTrails);
    }

    function loadLight() {

        const HemisphereLight = new THREE.HemisphereLight(0x999999, 0xbbbbff, 0.6);
        HemisphereLight.position.set(0, 1, 0);
        scene.add(HemisphereLight);

        const HemisphereLight1 = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        HemisphereLight1.position.set(5, 5, 5);
        scene.add(HemisphereLight1);

        const DirectionalLight = new THREE.DirectionalLight(0x666666, 0.5);
        DirectionalLight.position.set(5, 5, 5);
        scene.add(DirectionalLight);

        const SpotLight = new THREE.SpotLight(0xffffff, 0.1);
        SpotLight.position.set(-50, 50, 50);
        scene.add(SpotLight);

        // const LightHelper1 = new THREE.HemisphereLightHelper(HemisphereLight);
        // const LightHelper2 = new THREE.HemisphereLightHelper(HemisphereLight1);
        // const LightHelper3 = new THREE.SpotLightHelper(SpotLight);
        // const LightHelper4 = new THREE.DirectionalLightHelper(DirectionalLight);
        // scene.add(LightHelper1);
        // scene.add(LightHelper2);
        // scene.add(LightHelper3);
        // scene.add(LightHelper4);
        // scene.add(new THREE.AxesHelper(500));
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleController(controller) {
        const userData = controller.userData;
        cursor.set(0, 0, -0.2).applyMatrix4(camera.matrixWorld);
        if (userData.isSelecting === true) {
            if (userData.skipFrames >= 0) {
                // TODO(mrdoob) Revisit this
                userData.skipFrames--;
                painter.moveTo(cursor);
            } else {
                painter.lineTo(cursor);
                locations.push([cursor.x, cursor.y, cursor.z]);
                painter.update();
            }
        }
    }

    function animate() {
        renderer.setAnimationLoop(render);
    }

    function render() {
        handleController(controller);
        if (aircraft) {
            placeAircraft();
        }

        if (false) {
            planeMesh.material.roughness = params.roughness;
            planeMesh.material.metalness = params.metalness;

            let newEnvMap = planeMesh.material.envMap;
            let background = scene.background;

            switch (params.envMap) {

                case 'EXR':
                    newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
                    background = exrBackground;
                    break;
                case 'PNG':
                    newEnvMap = pngCubeRenderTarget ? pngCubeRenderTarget.texture : null;
                    background = pngBackground;
                    break;

            }

            if (newEnvMap !== planeMesh.material.envMap) {

                planeMesh.material.envMap = newEnvMap;
                planeMesh.material.needsUpdate = true;

                planeMesh.material.map = newEnvMap;
                planeMesh.material.needsUpdate = true;

            }

            planeMesh.rotation.y += 0.005;
            planeMesh.visible = params.debug;

            scene.background = background;
            renderer.toneMappingExposure = params.exposure;
        }
        renderer.render(scene, camera);
    }

    function placeAircraft() {
        if (locations.length === 0) {
            aircraft?.position.set(0, 0, 0);
            aircraft?.rotation.set(0, 0, 0);
            trails.forEach(trail => trail.position.set(NaN, 0, 0));
            trails.forEach(trail => trail.rotation.set(0, 0, 0));
        } else if (locations.length === 1)
            aircraft?.position.set(...locations[0]);
        else {
            if (mode == 'dynamic') {
                const smoothLocations = smooth(addMidpoints(locations, 8));
                const currentTravelPercent = getCurrentTravelPercent();
                //document.getElementById("button-reset").innerHTML = (currentTravelPercent*100).toFixed(2);
                const currLoc = currentLocationByPercent(smoothLocations, currentTravelPercent),
                    nextLoc = currentLocationByPercent(smoothLocations, currentTravelPercent + 0.01);

                aircraft?.position.set(...currLoc);
                aircraft.lookAt(...nextLoc);

                for (let i = 0; i < trails.length; i++) {
                    const currTrailLoc = currentLocationByPercent(smoothLocations, currentTravelPercent + 0.97 - (i / 50));
                    trails[i].position.set(...currTrailLoc);
                    trails[i].rotation.x += (0.01 + i / 700);
                    trails[i].rotation.y += (0.02 + i / 600);
                    trails[i].rotation.z += (0.03 + i / 500);
                }
            } else {
                aircraft?.position.set(...locations[locations.length - 1]);
                aircraft.rotation.set(0, 0, 0);
            }
        }
    }

    function smooth(locations) {
        let result = [locations[0]];
        for (let i = 1; i < locations.length - 1; i++) {
            result.push(
                [
                    (locations[i - 1][0] + locations[i][0] + locations[i + 1][0]) / 3,
                    (locations[i - 1][1] + locations[i][1] + locations[i + 1][1]) / 3,
                    (locations[i - 1][2] + locations[i][2] + locations[i + 1][2]) / 3
                ]
            );
        }
        result.push(locations[locations.length - 1]);
        return result;
    }

    function addMidpoints(locations, iterations = 1) {
        let result = [locations[0]];
        for (let i = 1; i < locations.length; i++) {
            result.push(
                [
                    (locations[i - 1][0] + locations[i][0]) / 2,
                    (locations[i - 1][1] + locations[i][1]) / 2,
                    (locations[i - 1][2] + locations[i][2]) / 2
                ],
                locations[i]
            );
        }
        if (iterations > 1)
            return addMidpoints(locations, iterations - 1);
        return result;
    }

    function currentLocationByPercent(locations, percent) {
        if (percent >= 1)
            return currentLocationByPercent(locations, percent % 1);
        if (percent < 0)
            return currentLocationByPercent(locations, (percent + 100) % 1);

        const totalLen = travelLength(locations);
        let idx, sum = 0;
        for (idx = 0; idx <= locations.length && sum <= totalLen * percent; idx++) {
            sum += oclidianDistance(locations[idx], locations[(idx + 1) % locations.length]);
        }
        if (!locations[idx] || !locations[(idx + 1) % locations.length])
            debugger;
        const r = (sum - totalLen * percent) / oclidianDistance(locations[idx - 1], locations[idx]);

        return locations[idx].map((val, axis) => val * r + locations[(idx + 1) % locations.length][axis] * (1 - r));
    }

    function getCurrentTravelPercent() {
        const totalMillis = travelLength(locations) * 5000;
        if (Date.now() - animationCycleStart > totalMillis)
            animationCycleStart = Date.now();

        return (Date.now() - animationCycleStart) / totalMillis;
    }

    function travelLength(locations) {
        let result = 0;
        for (let i = 0; i < locations.length; i++) {
            result += oclidianDistance(locations[i], locations[(i + 1) % locations.length]);
        }
        return result;
    }

    function oclidianDistance([x0, y0, z0], [x1, y1, z1]) {
        return Math.sqrt(
            Math.pow(x1 - x0, 2) +
            Math.pow(y1 - y0, 2) +
            Math.pow(z1 - z0, 2)
        );
    }
}, 100)