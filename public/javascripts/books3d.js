/*
 * Author: Alin Ciocan
 *
 * Dependencies: ThreeJS r61, jQuery, myUtils.js, RequestAnimationFrame.js,
 *               TrackballControls.js, stats.min.js, OBJLoader.js.
 * */

var container, stats;
var camera, scene, renderer, controls;


function init() {
    log("worked init");
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);

    camera.position.set(-16, 42, 42);


    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 1;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.target.set(20, 0, 0);

    controls.addEventListener('change', render);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    // renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);


    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;

    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    // controls.enabled = false
    window.addEventListener('resize', onWindowResize, false);
}

function fillScene() {
    cube = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshLambertMaterial({color: "red"}));
    scene.add(cube);

    light = getNewDirectLight();
    light.position.set(100,100,0);
    scene.add(light);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.handleResize();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}

// START POINT
main();

function main() {

    init();
    fillScene();
    animate();
}



