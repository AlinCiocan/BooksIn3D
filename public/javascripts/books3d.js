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

    camera.position.set(0, 100, 300);

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

                log("pointer LOCKED", event);

            } else {

                controls.enabled = false;

                log("pointer lock RELEASED", event);
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
    light.position.set(100, 100, 100);
    scene.add(light);


    var floorTexture = THREE.ImageUtils.loadTexture("http://localhost:3000/images/ground.jpg");
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(100, 100);
    floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({map: floorTexture}));
    floor.rotateX(degreeToRad(-90));
    scene.add(floor);

    addBook(250);
}

function addBook(numberOfPages) {
    // CONSTANTS
    numberOfPages = numberOfPages || 100;
    var pagesWidth = (5 * numberOfPages)/100, // just a way to differentiate between books with more pages
        bookHeight = 70,
        coverWidth = 1,
        pagesHeight = bookHeight - 5,
        bookDepth = 50,
        pagesDepth = bookDepth - coverWidth,
        spineCoverWidth = pagesWidth + 2 * coverWidth;


    // the book
    var book = new THREE.Object3D();

    var pagesMaterial = new THREE.MeshBasicMaterial({color: "white"});
    var pages = new THREE.Mesh(new THREE.CubeGeometry(pagesWidth, pagesHeight, pagesDepth), pagesMaterial);
    book.add(pages);


    var coverMaterial = new THREE.MeshLambertMaterial({color: "green"});
    var spineBook = new THREE.Mesh(new THREE.CubeGeometry(spineCoverWidth, bookHeight, coverWidth), coverMaterial);
    spineBook.position.z -= pagesDepth / 2 + coverWidth / 2;
    book.add(spineBook);

    var cover = new THREE.Mesh(new THREE.CubeGeometry(coverWidth, bookHeight, pagesDepth + coverWidth), coverMaterial);
    cover.position.z += coverWidth / 2;
    var cover2 = cover.clone();
    // first cover
    cover.position.x += pagesWidth / 2 + coverWidth / 2;
    book.add(cover);
    // second cover
    cover2.position.x -= pagesWidth / 2 + coverWidth / 2;
    book.add(cover2);

    book.position.y += 100;
    scene.add(book);

    return book;
}

function createShelves() {

}

function createShelfBlock() {
    // CONSTANTS
    var numberOfShelves = 5,
        shelvesDepth = 20,
        shelvesWidth = 50,
        shelfHeight = 40;

    var block = new THREE.Object3D(),
        shelf;

    for(var i = 0; i < numberOfShelves; i++) {
        shelf = new THREE.Mesh();
    }



    scene.add(block);

    return block;

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

