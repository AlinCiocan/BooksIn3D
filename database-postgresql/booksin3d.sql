CREATE TABLE books(bookisbn character varying(40) NOT NULL,pages numeric,CONSTRAINT "PK_bookisbn" PRIMARY KEY (bookisbn))WITH (OIDS=FALSE);

CREATE TABLE users(goodreadsid character varying(15) NOT NULL, displayname character varying(40), CONSTRAINT "PK_goodreadsid" PRIMARY KEY(goodreadsid)) WITH (OIDS=FALSE);

CREATE TABLE users_books(goodreadsid character varying(20) NOT NULL,bookisbn character varying(40) NOT NULL,  CONSTRAINT users_books_pkey PRIMARY KEY (goodreadsid, bookisbn),  CONSTRAINT "FK_bookisbn" FOREIGN KEY (bookisbn) REFERENCES books (bookisbn) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION, CONSTRAINT "FK_gid" FOREIGN KEY (goodreadsid) REFERENCES users (goodreadsid) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION) WITH (OIDS=FALSE);
