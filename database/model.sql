-- Create the show designer database model

DROP TABLE IF EXISTS fixture;
DROP TABLE IF EXISTS manufacturer;

CREATE TABLE manufacturer (
    short_name VARCHAR(200) NOT NULL PRIMARY KEY,
    name VARCHAR(200),
    website VARCHAR(1000)
);

CREATE TABLE fixture (
    name VARCHAR(200) NOT NULL,
    manufacturer_short_name VARCHAR(200) NOT NULL,
    object TEXT,
    PRIMARY KEY(name, manufacturer_short_name),
    FOREIGN KEY(manufacturer_short_name) REFERENCES manufacturer(short_name)
);