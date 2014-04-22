/**
 * Created by AlinC on 2/7/14.
 */

var TextureLoader = (function () {

    return {
        loadLocalImage: function (imageName) {
            return THREE.ImageUtils.loadTexture("images/" + imageName);
        },

        loadImage: function (url) {
            return THREE.ImageUtils.loadTexture(url);
        }

    };

})();