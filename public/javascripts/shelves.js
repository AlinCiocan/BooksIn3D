var SHELVES = (function () {
    // CONSTANTS
    var bookHeight = BOOKS.bookHeight,
    /*closets constants*/
        depthDistanceBetweenClosets = 500,
        widthDistanceBetweenClosets = 300,
        roomSize = 1500,
        startPosition = {
            x: 0,
            z: 0
        },// the width of the room with is the depth of shelves blocks
    /* shelves constants */
        numberOfShelves = 2,
        shelvesDepth = 70,
        shelvesWidth = 500,
        shelfHeight = 100,
        shelfThickness = 3,
        numberOfBlocksInCloset = 3, //!! must be bigger than 0(zero)
        distanceBetweenBooksInShelf = 10,
        offsetForBooksAngle = 20, // a heuristic offset for books (due to 'y' rotation)
        bookRotationAngle = 25, // in degrees
    // SIDE CONSTANTS
        FLIPPED = "flipped", NORMAL = "normal";

    // ATTRIBUTES
    var listOfShleves = [];


    // PRIVATE FUNCTIONS
    function calculateNumberOfClosets(books) {
        //TODO: redo this function, because this code is not calculating well anymore
        var shelfCapacity = shelvesWidth - offsetForBooksAngle;
        var booksLength = books.length, bookWidth, currShelfCapacity = shelfCapacity,
            numberOfShelvesNeeded = 1, numberOfClosetsNeeded;
        for (var i = 0; i < booksLength; i++) {
            bookWidth = books[i].width + distanceBetweenBooksInShelf;
            // if is not enough space
            if (currShelfCapacity - bookWidth < 0) { // it needs another shelf
                numberOfShelvesNeeded++;
                currShelfCapacity = shelfCapacity;
            }
            currShelfCapacity -= bookWidth;
        }
        numberOfClosetsNeeded = Math.ceil(numberOfShelvesNeeded / (numberOfShelves * numberOfBlocksInCloset * 2));
        return numberOfClosetsNeeded + 1;
    }


    function addShelvesClosets(numberOfClosets) {
        var closets = [], i, closet, library = new THREE.Object3D();
        window.closets = closets;

        for (i = 0; i < numberOfClosets; i++) {
            closet = new THREE.Object3D();

            //TODO remove global scope
            window.unitBlock1 = createShelfUnitBlocks();
            window.unitBlock2 = createShelfUnitBlocks();


            closet.add(unitBlock1);
            closet.add(unitBlock2);


            unitBlock2.rotation.y += degreeToRad(180); // reverse

            unitBlock2.position.x -= unitBlock1.width - shelvesWidth - shelfThickness;
            unitBlock2.position.z += unitBlock1.depth;


            closet.width = unitBlock1.width * 2;
            closet.depth = unitBlock1.depth * 2;

            closets.push(closet);
            library.add(closet);
        }

        var roomRows = Math.floor(roomSize / (depthDistanceBetweenClosets + closet.depth));
        for (i = 0; i < numberOfClosets; i++) {
            closet = closets[i];

            closet.position.x = Math.floor(i / roomRows) * (widthDistanceBetweenClosets + closet.width / 2) + startPosition.x;
            closet.position.z = (i % roomRows) * (depthDistanceBetweenClosets + closet.depth) + startPosition.z;

        }

        window.closets = closets;

        scene.add(library);
        return library;
    }


    function createShelfUnitBlocks() {
        var closet = new THREE.Object3D() , block;
        block = createShelfBlock(true);
        closet.add(block);

        for (var i = 0; i < numberOfBlocksInCloset - 1; i++) {
            block = createShelfBlock();
            block.position.x -= (i + 1) * block.width;
            closet.add(block);

        }

        scene.add(closet);
        // add at runtime, width and depth of closet
        closet.width = block.width * numberOfBlocksInCloset;
        closet.depth = block.depth;
        return closet;
    }


    function createShelfBlock(addLeftPlank) {
        // block variable encapsulates the shelves and planks
        var block = new THREE.Object3D(),
            shelvesMaterial = new THREE.MeshLambertMaterial({color: "brown"}),
            shelfMesh = new THREE.Mesh(new THREE.CubeGeometry(shelvesWidth, shelfThickness, shelvesDepth), shelvesMaterial),
            shelf,
            plankMesh = new THREE.Mesh(new THREE.CubeGeometry(shelfThickness, numberOfShelves * shelfHeight + shelfThickness, shelvesDepth), shelvesMaterial),
            plank;


        // if the block doesn't have the left plank, then the width of the insidePlank must
        // be minus the thickness of the left plank
        var insidePlankWidth = shelvesWidth + shelfThickness * (addLeftPlank ? 2 : 1);

        var insidePlankMaterial = new THREE.MeshLambertMaterial({color: "pink"});

        // create an array with six textures for a cool cube
        var materialArray = [];
        materialArray.push(shelvesMaterial);
        materialArray.push(shelvesMaterial);
        materialArray.push(shelvesMaterial);
        materialArray.push(shelvesMaterial);
        materialArray.push(insidePlankMaterial); // for z-fighting
        materialArray.push(insidePlankMaterial);
        var insidePlank = new THREE.Mesh(new THREE.CubeGeometry(insidePlankWidth, numberOfShelves * shelfHeight + shelfThickness, shelfThickness / 2), new THREE.MeshFaceMaterial(materialArray));

        insidePlank.position.y += insidePlank.geometry.height / 2;
        insidePlank.position.z += shelvesDepth / 2 + shelfThickness / 4;

        plankMesh.position.y += plankMesh.geometry.height / 2;//(numberOfShelves * shelfHeight) / 2 + shelfThickness / 2;
        shelfMesh.position.y += shelfThickness / 2;

        // if do not add left plank is not set
        if (addLeftPlank) {
            // left plank
            plank = plankMesh.clone();
            plank.position.x += shelvesWidth / 2 + shelfThickness / 2;
            block.add(plank);


        } else {
            insidePlank.position.x -= shelfThickness / 2;
        }


        block.add(insidePlank);


        // right plank
        plank = plankMesh.clone();
        plank.position.x -= shelvesWidth / 2 + shelfThickness / 2;
        block.add(plank);

        // shelves
        for (var i = 0; i < numberOfShelves + 1; i++) {
            shelf = shelfMesh.clone();
            shelf.position.y += i * shelfHeight;


            listOfShleves.push(shelf);

            block.add(shelf);
        }
        // remove the last one, because is not a shelf is just the top plank
        listOfShleves.pop();

        scene.add(block);

        // add with at runtime
        block.width = shelvesWidth + shelfThickness * (addLeftPlank ? 2 : 1);
        block.depth = shelvesDepth + shelfThickness;

        return block;
    }


    function addBooksInLibrary(books) {

        var numberOfClosets = calculateNumberOfClosets(books);
        var library = addShelvesClosets(numberOfClosets);


        scene.updateMatrixWorld();


        var i, side = FLIPPED, shelf;
        var vector = new THREE.Vector3();
        var shelvesCoord = [];
        for (i = 0; i < listOfShleves.length; i++) {
            shelf = listOfShleves[i];
            vector.setFromMatrixPosition(shelf.matrixWorld);

            // calculate which shelf is flipped
            side = i % (numberOfShelves * numberOfBlocksInCloset) == 0 ?
                (side == NORMAL) ? FLIPPED : NORMAL
                : side;

            shelvesCoord.push({
                x: vector.x + shelvesWidth / 2 - offsetForBooksAngle,
                y: vector.y,
                z: vector.z,
                side: side
            });
        }


        var booksLength = books.length, book, shelfCount = 0, shelfCapacity = shelvesWidth, currentShelf = shelvesCoord[shelfCount], shelfWidthOffset;
        for (i = 0; i < booksLength; i++) {

            book = books[i];
            library.add(book);
            log("book depth", BOOKS.bookDepth);
            var bookWidth = book.width / 2 + BOOKS.bookDepth / 2 + distanceBetweenBooksInShelf;
            // if is not enough space on the shelf
            if (shelfCapacity - bookWidth < 0) {
                // go to the next shelf and start adding
                shelfCount++;
                shelfCapacity = shelvesWidth;
                currentShelf = shelvesCoord[shelfCount];
            }
            shelfCapacity -= bookWidth;
            shelfWidthOffset = shelvesWidth - shelfCapacity - bookWidth / 2;


            book.position.x = currentShelf.x - shelfWidthOffset + distanceBetweenBooksInShelf;
            book.position.y = currentShelf.y + bookHeight / 2;
            book.position.z = currentShelf.z;

            if (currentShelf.side == FLIPPED) {
                book.rotation.y += degreeToRad(bookRotationAngle);
            } else {
                book.rotation.y -= degreeToRad(bookRotationAngle);
            }


        }
        return library;
    }

    // Expose this function as public
    return {
        addBooksInLibrary: addBooksInLibrary
    };

})();