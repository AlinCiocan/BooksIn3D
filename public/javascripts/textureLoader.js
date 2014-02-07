/**
 * Created by AlinC on 2/7/14.
 */

var TextureLoader = (function () {

    var ABSOLUTE_URL = "http://localhost:3000/";

    return {
        loadLocal: function (url) {
            return THREE.ImageUtils.loadTexture(ABSOLUTE_URL + url);
        },

        loadlocalImage: function (imageName) {
            return THREE.ImageUtils.loadTexture(ABSOLUTE_URL + "images/" + imageName);
        },

        loadImage: function (url) {
            return THREE.ImageUtils.loadTexture(url);
        }

    };

})();