/*
 * Author: Alin Ciocan
 *
 * Dependencies: ThreeJS r61, jQuery, myUtils.js, RequestAnimationFrame.js,
 *               TrackballControls.js, stats.min.js, OBJLoader.js.
 * */

var container, stats;
var camera, scene, renderer, controls, time = Date.now();


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

function fillScene() {
    var cube = new THREE.Mesh(new THREE.CubeGeometry(100, 600, 50), new THREE.MeshLambertMaterial({color: "red"}));
    cube.position.z -= 200;
    // scene.add(cube);

    light = getNewDirectLight();
    light.position.set(-2074, 500, 400);
    scene.add(light);

    light = getNewDirectLight();
    light.position.set(-174, 800, -500);
    scene.add(light);


    var floorTexture = TextureLoader.loadlocalImage("ground.jpg");
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(100, 100);
    floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({map: floorTexture}));
    floor.rotateX(degreeToRad(-90));
    scene.add(floor);

    /*    myCube = new THREE.Mesh( new THREE.CubeGeometry(20,20,20) , new THREE.MeshBasicMaterial({color:"red"}) );
     scene.add(myCube);*/

    books = BOOKS.createBooks(dbBooks);
    // books = BOOKS.generateRandomBooks(10);
    library = SHELVES.addBooksInLibrary(books);

    // just for debug purposes
    /*    for (var contor = 0; contor < books.length; contor++) {
     scene.add(books[contor]);
     }
     scene.remove(library);*/
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

