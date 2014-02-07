var BOOKS = (function () {
    // CONSTANTS
    var bookHeight = 70,
        coverWidth = 1,
        pagesHeight = bookHeight - 5,
        bookDepth = 50,
        pagesDepth = bookDepth - coverWidth;

    // PRIVATE FUNCTIONS
    function getCoverImage(imageUrl, coverMaterial) {
        var coverImageTexture = TextureLoader.loadImage(imageUrl);
        coverImageTexture.wrapS = coverImageTexture.wrapT = THREE.RepeatWrapping;
        coverImageTexture.repeat.set(1, 1);
        var coverImageMaterial = new THREE.MeshPhongMaterial({map: coverImageTexture, side: THREE.DoubleSide });
        var materialsArray = [];
        materialsArray.push(coverMaterial);
        materialsArray.push(coverImageMaterial);
        materialsArray.push(coverMaterial);
        materialsArray.push(coverMaterial);
        materialsArray.push(coverMaterial);
        materialsArray.push(coverMaterial);
        return new THREE.MeshFaceMaterial(materialsArray);
    }

    return {
        bookHeight: bookHeight,
        bookDepth: bookDepth,

        generateBooks: function (size) {
            var books = [];
            for (var i = 0; i < size; i++) {
                var pages = Math.floor(Math.random() * 50 + 200);
                books.push(this.addBook(pages));
            }

            return books;
        },

        addBook: function (numberOfPages, id) {
            numberOfPages = numberOfPages || 100;
            var pagesWidth = Math.ceil((5 * numberOfPages) / 100), // just a way to differentiate between books with more pages
                spineCoverWidth = pagesWidth + 2 * coverWidth;
            // the book
            var book = new THREE.Object3D();

            // pages
            var pagesMaterial = new THREE.MeshBasicMaterial({color: "white"});
            var pages = new THREE.Mesh(new THREE.CubeGeometry(pagesWidth, pagesHeight, pagesDepth), pagesMaterial);
            book.add(pages);

            // covers
            var coverMaterial = new THREE.MeshLambertMaterial({color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)});
            var spineBook = new THREE.Mesh(new THREE.CubeGeometry(spineCoverWidth, bookHeight, coverWidth), coverMaterial);
            spineBook.position.z -= pagesDepth / 2 + coverWidth / 2;
            book.add(spineBook);
            var cover = new THREE.Mesh(new THREE.CubeGeometry(coverWidth, bookHeight, pagesDepth + coverWidth), coverMaterial);
            cover.position.z += coverWidth / 2;

            var cover2 = new THREE.Mesh(new THREE.CubeGeometry(coverWidth, bookHeight, pagesDepth + coverWidth), getCoverImage("http://localhost:3000/images/cover.jpg", coverMaterial));
            cover2.position.z += coverWidth / 2;

            // first cover
            cover.position.x += pagesWidth / 2 + coverWidth / 2;
            book.add(cover);
            // second cover
            cover2.position.x -= pagesWidth / 2 + coverWidth / 2;
            book.add(cover2);


            // add at runtime
            book.width = pagesWidth + coverWidth * 2;
            book.bookId = id;


            scene.add(book);
            return book;
        }
    };
})();
