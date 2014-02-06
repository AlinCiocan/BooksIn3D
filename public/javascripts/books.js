var BOOKS = (function () {
    // CONSTANTS
    var bookHeight = 70,
        coverWidth = 1,
        pagesHeight = bookHeight - 5,
        bookDepth = 50,
        pagesDepth = bookDepth - coverWidth,
    /* shelves constants */
        numberOfShelves = 3,
        shelvesDepth = 70,
        shelvesWidth = 450,
        shelfHeight = 100,
        shelfThickness = 3,
        numberOfBlocksInCloset = 1, //!! must be bigger than 0(zero)
    // SIDE CONSTANTS
        FLIPPED = "flipped", NORMAL = "normal";


    // ATTRIBUTES
    window.shelvesCoord = [];

    return {
        generateBooks: function (size) {
            var books = [];
            for (var i = 0; i < size; i++) {
                var pages = Math.floor(Math.random() * 1000 + 700);
                books.push(this.addBook(200));
            }

            return books;
        },


        addBook: function (numberOfPages) {
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
            var cover2 = cover.clone();
            // first cover
            cover.position.x += pagesWidth / 2 + coverWidth / 2;
            book.add(cover);
            // second cover
            cover2.position.x -= pagesWidth / 2 + coverWidth / 2;
            book.add(cover2);


            book.width = pagesWidth + coverWidth * 2;
            log("book.width", book.width, "pagesWidth", pagesWidth, "numberOfPages", numberOfPages, "coverWidth", 2 * coverWidth);

            scene.add(book);
            return book;
        },


        // TODO:  make dynamic shelves which takes an array of books and put them in the shelves
        addBooksInLibrary: function (books) {
            shelvesCoord = []; // reset shelves

            function calculateNumberOfClosets(books) {
                var booksLength = books.length, totalWidthOfBooks = 0, numberOfClosetsNeeded;
                for (var i = 0; i < booksLength; i++) {
                    totalWidthOfBooks += books[i].width;
                }

                // the total width capacity of a closet to be filled with books
                var widthCapacityOfTheCloset = shelvesWidth * numberOfShelves * numberOfBlocksInCloset
                    * 2; // multiplied by because a closet is made by two unit blocks

                numberOfClosetsNeeded = Math.ceil(totalWidthOfBooks / widthCapacityOfTheCloset);
                return numberOfClosetsNeeded;

            }

            var numberOfClosets = calculateNumberOfClosets(books);
            var library = this.addShelvesClosets(numberOfClosets);

            var booksLength = books.length, book, shelfCount = 0, shelfCapacity = shelvesWidth, currentShelf = shelvesCoord[shelfCount], shelfWidthOffset;
            for (var i = 0; i < booksLength; i++) {
                book = books[i];
                library.add(book);

                // is enough space on the shelf
                if (shelfCapacity - book.width > 0) {
                    shelfCapacity -= book.width;
                } else { // go to the next shelf and start adding
                    shelfCount++;
                    shelfCapacity = shelvesWidth;
                    currentShelf = shelvesCoord[shelfCount];
                }
                shelfWidthOffset = shelvesWidth - shelfCapacity;

                if(currentShelf.side == FLIPPED) {
                     book.rotation.y += degreeToRad(180);
                }

                book.position.x = currentShelf.x + shelfWidthOffset + book.width - coverWidth * 5;
                book.position.y = currentShelf.y + bookHeight / 2;
                book.position.z = currentShelf.z;



            }


            return library;
        },


        addShelvesClosets: function (numberOfClosets) {
            var depthDistanceBetweenClosets = 300,
                widthDistanceBetweenClosets = 300,
                roomSize = 1500,
                startPosition = {
                    x: 0,
                    z: 0
                };// the width of the room with is the depth of shelves blocks

            var closets = [], i, closet, library = new THREE.Object3D();
            window.closets = closets;

            function flipSideForLastShelves() {

                var start = shelvesCoord.length - 1;
                var end = shelvesCoord.length - (numberOfShelves * numberOfBlocksInCloset);
                for (var i = start; i >= end; i--) {
                    shelvesCoord[i].side = FLIPPED;
                    shelvesCoord[i].z = (shelvesDepth + shelfThickness);
                }
            }

            for (i = 0; i < numberOfClosets; i++) {
                closet = new THREE.Object3D();

                var unitBlock1 = this.createShelfUnitBlocks();
                var unitBlock2 = this.createShelfUnitBlocks();

                flipSideForLastShelves();

                closet.add(unitBlock1);
                closet.add(unitBlock2);

                unitBlock2.rotation.y += degreeToRad(180); // reverse
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


            scene.add(library);
            return library;
        },


        createShelfUnitBlocks: function () {

            function addToShelvesCoord() {
                for (j = numberOfShelves - 1; j >= 0; j--) {
                    shelvesCoord.push({
                        x: block.position.x + shelfThickness ,
                        y: shelfHeight * j + shelfThickness * (j + 1),
                        z: block.position.z, // TODO: if books are too inside add here bookDepth/2
                        side: NORMAL
                    });
                }
            }

            var closet = new THREE.Object3D() , block, j;

            // TODO: !! refatcor the for which appears twice
            block = this.createShelfBlock(true);
            closet.add(block);

            addToShelvesCoord();
            for (var i = 0; i < numberOfBlocksInCloset - 1; i++) {
                block = this.createShelfBlock();
                block.position.x -= (i + 1) * block.width;
                closet.add(block);

                addToShelvesCoord();
            }

            scene.add(closet);
            // add at runtime, width and depth of closet
            closet.width = block.width * numberOfBlocksInCloset;
            closet.depth = block.depth;
            return closet;
        },


        createShelfBlock: function (addLeftPlank) {
            // block variable encapsulates the shelves and planks
            var block = new THREE.Object3D(),
                shelvesMaterial = new THREE.MeshLambertMaterial({color: "brown"}),
                shelfMesh = new THREE.Mesh(new THREE.CubeGeometry(shelvesWidth, shelfThickness, shelvesDepth), shelvesMaterial),
                shelf,
                plankMesh = new THREE.Mesh(new THREE.CubeGeometry(shelfThickness, numberOfShelves * shelfHeight + shelfThickness, shelvesDepth), shelvesMaterial),
                plank;


            // TODO: unsure if it looks better with or without inside plank and the color of the inside plank
            // if the block doesn't have the left plank, then the width of the insidePlank must
            // be minus the thickness of the left plank
            var insidePlankWidth = shelvesWidth + shelfThickness * (addLeftPlank ? 2 : 1) - 3;

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
                block.add(shelf);
            }

            scene.add(block);

            // add with at runtime
            block.width = shelvesWidth + shelfThickness * (addLeftPlank ? 2 : 1);
            block.depth = shelvesDepth + shelfThickness;

            return block;
        }
    };
})();


// just for debug purposes
/*

 function showClosets() {
 console.table(showNice(closets), ["index", "x", "z", "y"]);
 }

 function showNice(closets) {
 var newClosets = [];
 for (var i = 0; i < closets.length; i++) {
 newClosets.push({
 index: i,
 x: closets[i].position.x,
 y: closets[i].position.y,
 z: closets[i].position.z
 });
 }
 return newClosets;
 }*/
