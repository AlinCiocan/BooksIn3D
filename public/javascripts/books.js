var BOOKS = (function () {
    // CONSTANTS
    var bookHeight = 70,
        coverWidth = 1,
        pagesHeight = bookHeight - 5,
        bookDepth = 50,
        pagesDepth = bookDepth - coverWidth,
    /* shelves constants */
        numberOfShelves = 5,
        shelvesDepth = 70,
        shelvesWidth = 300,
        shelfHeight = 100,
        shelfThickness = 3;


    return {
        addBook: function (numberOfPages) {
            numberOfPages = numberOfPages || 100;
            var pagesWidth = (5 * numberOfPages) / 100, // just a way to differentiate between books with more pages
                spineCoverWidth = pagesWidth + 2 * coverWidth;
            // the book
            var book = new THREE.Object3D();

            // pages
            var pagesMaterial = new THREE.MeshBasicMaterial({color: "white"});
            var pages = new THREE.Mesh(new THREE.CubeGeometry(pagesWidth, pagesHeight, pagesDepth), pagesMaterial);
            book.add(pages);

            // covers
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


            // TODO: remove this (just for debug purposes is here)
            book.position.y = 3;
            book.position.y += bookHeight / 2;
            book.position.z = 8;

            scene.add(book);
            return book;
        },

        createShelves: function () {

        },

        createShelfBlock: function (doNotAddLeftPlank) {
            // block variable encapsulates the shelves and planks
            var block = new THREE.Object3D(),
                shelvesMaterial = new THREE.MeshLambertMaterial({color: "brown"}),
                shelfMesh = new THREE.Mesh(new THREE.CubeGeometry(shelvesWidth, shelfThickness, shelvesDepth), shelvesMaterial),
                shelf,
                plankMesh = new THREE.Mesh(new THREE.CubeGeometry(shelfThickness, numberOfShelves * shelfHeight + shelfThickness, shelvesDepth), shelvesMaterial),
                plank;

            // TODO: unsure if it looks better with or without inside plank
            var insidePlank = new THREE.Mesh(new THREE.CubeGeometry(shelvesWidth + shelfThickness * 2, numberOfShelves * shelfHeight + shelfThickness, shelfThickness), shelvesMaterial);
            insidePlank.material = new THREE.MeshLambertMaterial({color: 0xFFEBD6})
            insidePlank.position.y += insidePlank.geometry.height / 2;
            insidePlank.position.z += shelvesDepth / 2 + shelfThickness / 2;

            block.add(insidePlank);

            plankMesh.position.y += plankMesh.geometry.height / 2;//(numberOfShelves * shelfHeight) / 2 + shelfThickness / 2;
            shelfMesh.position.y += shelfThickness / 2;

            // if do not add left plank is not set
            if (!doNotAddLeftPlank) {
                // left plank
                plank = plankMesh.clone();
                plank.position.x += shelvesWidth / 2 + shelfThickness / 2;
                block.add(plank);
            }

            // right plank
            plank = plankMesh.clone();
            plank.position.x -= shelvesWidth / 2 + shelfThickness / 2;
            block.add(plank);

            for (var i = 0; i < numberOfShelves + 1; i++) {
                shelf = shelfMesh.clone();
                shelf.position.y += i * shelfHeight;
                block.add(shelf);
            }

            scene.add(block);

            return block;
        }
    };
})();
