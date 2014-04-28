/*
 * Author: Alin Ciocan
 *
 * Dependencies: ThreeJS r61, jQuery, myUtils.js, RequestAnimationFrame.js,
 *               TrackballControls.js, stats.min.js, OBJLoader.js.
 * */

var container, stats;
var camera, scene, renderer, controls, time = Date.now();
var books, library, floor;
var FLOOR_SIZE = 10000;
var light;
function init() {
    container = document.createElement('div');
    document.body.appendChild(container);
    //SCENE
    scene = new THREE.Scene();


    // CAMERA
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);

    camera.position.set(0, 500, -300);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    camera.addEventListener('change', render);


    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    // http://www.html5rocks.com/en/tutorials/pointerlock/intro/

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if (havePointerLock) {

        var element = document.body;

        var pointerlockchange = function (event) {

            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                controls.enabled = true;
            } else {
                controls.enabled = false;
            }

        }

        var pointerlockerror = function (event) {

            log("error pointerlockerror:", event);

        }

        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        document.addEventListener("click", function hidePointer() {


            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if (/Firefox/i.test(navigator.userAgent)) {

                var fullscreenchange = function (event) {

                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);

                        element.requestPointerLock();
                    }

                }

                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                element.requestFullscreen();

            } else {

                element.requestPointerLock();

            }

        }, false);

    } else {

        alert('Your browser doesn\'t seem to support Pointer Lock API');

    }

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

var changeGround;

function fillScene() {

    light = getDirectionalLight();
    light.position.set(-2074, 500, 400);

    light = getDirectionalLight();
    light.position.set(226, 800, -900);
    var directionalLight = light.children[0];
    directionalLight.target.position.set(0, 0, -3000);

    var floorTexture = TextureLoader.loadLocalImage("ground.jpg");
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(100, 100);

    changeGround = function (pic, nr) {
        var floorTexture = TextureLoader.loadLocalImage("ground" + (pic || "") + ".jpg");
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(nr || 100, nr || 100);
        floor.material = new THREE.MeshBasicMaterial({map: floorTexture});
    };

    floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE), new THREE.MeshBasicMaterial({map: floorTexture}));
    floor.rotateX(degreeToRadians(-90));
    scene.add(floor);


    books = BOOKS.createBooks(dbBooks);
    // books = BOOKS.generateRandomBooks(10);
    library = SHELVES.addBooksInLibrary(books);
    library.position.z = -3000;
    library.rotation.y -= degreeToRadians(180);

    changeGround(5, 50);
}

function loadOBJFile(objFile, callback) {
    var loader = new THREE.OBJLoader();
    var material = new THREE.MeshPhongMaterial({color: 0xff0f0f});

    loader.load(objFile, function (object) {

        object.traverse(function (child) {
            log(child);
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });
        // the contract of the callback
        callback(object);
    });
}

// TODO: not sure if it actually looks that good
function createWalls() {
    var WALL_HEIGHT = 2000;
    var FLOOR_SIZE_2 = (FLOOR_SIZE / 2);

    var wallGeometry = new THREE.PlaneGeometry(FLOOR_SIZE, WALL_HEIGHT);
    var wallMaterial = new THREE.MeshLambertMaterial({color: "green", side: THREE.DoubleSide});

    var wall1, wall2, wall3, wall4;
    wall1 = new THREE.Mesh(wallGeometry, wallMaterial);


    wall1.position.y += WALL_HEIGHT / 2;


    wall2 = wall1.clone();
    wall3 = wall1.clone();
    wall4 = wall1.clone();


    wall1.position.z -= FLOOR_SIZE_2;

    wall2.position.z += FLOOR_SIZE_2;


    //  wall2.position.x -= FLOOR_SIZE_2;

    scene.add(wall1);
     scene.add(wall2);
     /*  scene.add(wall3);
     scene.add(wall4);*/

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //controls.handleResize();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);
    stats.update();
    controls.isOnObject(false);
    controls.update(Date.now() - time);
    render();
    time = Date.now();
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

// for debug purposes
function camClose() {
    camera.position.set(-33, 35, 40);
}

function camFar() {
    camera.position.set(-560, 550, 680);
}

