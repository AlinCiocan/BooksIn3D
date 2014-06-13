/**
 * Created by AlinC on 2/7/14.
 */

var TextureLoader = (function () {

    // this line is important for getting images from amazon s3
    THREE.ImageUtils.crossOrigin = "";

    return {
        loadLocalImage: function (imageName) {
            return THREE.ImageUtils.loadTexture("images/" + imageName);
        },

        loadImage: function (url) {
            return THREE.ImageUtils.loadTexture(url);
        }

    };

})();