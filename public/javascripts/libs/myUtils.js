/**
 * Created with IntelliJ IDEA.
 * User: Alin
 * Date: 25.11.2013
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

var DEBUG_MODE = true;

var RADIANS_CONVERSION = Math.PI / 180;
// convert an angle from degree to radians
function degreeToRad(angle) {
    return angle * RADIANS_CONVERSION;
}

function RadToDegree(angle) {
    return angle / RADIANS_CONVERSION;
}

// shorthand for console.log
window.log = function () {
    console.log.apply(console, arguments);
};

// adding clone for arrays
Array.prototype.clone = function () {
    return this.slice(0);
};

// adding remove method for arrays
Array.prototype.remove = function (elem) {
    var index = this.indexOf(elem);
    if (index > -1) {
        this.splice(index, 1);
    }
    return this;
};


function getNewDirectLight(intensity) {
    var newLight = new THREE.DirectionalLight(0xFFFFFF, intensity || 1.0);
    var sphereLight = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({color: 0xff0000}));
    // whenever the light moves, the sphere will move too
    sphereLight.position = newLight.position; // objects will share the same object for position

    if (DEBUG_MODE) {
        scene.add(sphereLight);
    }
    scene.add(newLight);
    return newLight;
}

/** TODO: Implement here
function getNewPointLight(intensity) {
    var newLight = new THREE.DirectionalLight(0xFFFFFF, intensity || 1.0);
    var sphereLight = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({color: 0xff0000}));
    // whenever the light moves, the sphere will move too
    sphereLight.position = newLight.position; // objects will share the same object for position

    if (DEBUG_MODE) {
        scene.add(sphereLight);
    }
    scene.add(newLight);
    return newLight;
}       */