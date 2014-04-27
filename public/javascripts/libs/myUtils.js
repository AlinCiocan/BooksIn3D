/**
 * Created with IntelliJ IDEA.
 * User: Alin
 * Date: 25.11.2013
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

var DEBUG_MODE = true;
if(DEBUG_MODE) {
    console.warn("DEBUG_MODE IS ON!")
}
var RADIANS_CONVERSION = Math.PI / 180;
// convert an angle from degree to radians
function degreeToRadians(angle) {
    return angle * RADIANS_CONVERSION;
}

function radiusToDegree(angle) {
    return angle / RADIANS_CONVERSION;
}

function getRandomColor() {
    return (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
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

function getPointLight(dist) {
    console.warn("Warning: method getPointLight is not tested!");
    var pointLight = new THREE.Object3D();
    var light = new THREE.PointLight(0x404040, 1, dist || 500);
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({color: 0x0000ff}));

    pointLight.add(light);
    pointLight.add(sphere);

    scene.add(pointLight);
    return pointLight;
}

function getDirectionalLight(intensity, color) {
    var newLight = new THREE.DirectionalLight(0xFFFFFF, intensity || 1.0);
    var sphereLight = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({color: color || 0xff0000}));

    var container = new THREE.Object3D();
    container.add(newLight);
    if (DEBUG_MODE) {
        container.add(sphereLight);
    }
    scene.add(container);
    return container;
}