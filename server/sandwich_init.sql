BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "sandwich_sizes" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "includedIngredients" INTEGER NOT NULL,
    "maxDressings" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "main_ingredients" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "breads" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "optional_ingredients" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "dressings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    FOREIGN KEY ("userId") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "order_sandwiches" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "sizeId" TEXT NOT NULL,
    "mainIngredientId" INTEGER NOT NULL,
    "breadId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    FOREIGN KEY ("orderId") REFERENCES "orders"("id"),
    FOREIGN KEY ("sizeId") REFERENCES "sandwich_sizes"("id"),
    FOREIGN KEY ("mainIngredientId") REFERENCES "main_ingredients"("id"),
    FOREIGN KEY ("breadId") REFERENCES "breads"("id")
);

CREATE TABLE IF NOT EXISTS "order_sandwich_ingredients" (
    "sandwichId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    PRIMARY KEY ("sandwichId", "ingredientId"),
    FOREIGN KEY ("sandwichId") REFERENCES "order_sandwiches"("id"),
    FOREIGN KEY ("ingredientId") REFERENCES "optional_ingredients"("id")
);

CREATE TABLE IF NOT EXISTS "order_sandwich_dressings" (
    "sandwichId" INTEGER NOT NULL,
    "dressingId" INTEGER NOT NULL,
    PRIMARY KEY ("sandwichId", "dressingId"),
    FOREIGN KEY ("sandwichId") REFERENCES "order_sandwiches"("id"),
    FOREIGN KEY ("dressingId") REFERENCES "dressings"("id")
);

INSERT INTO "sandwich_sizes" VALUES ('S', 'Small', 5, 10, 2, 1);
INSERT INTO "sandwich_sizes" VALUES ('M', 'Medium', 7, 8, 3, 2);
INSERT INTO "sandwich_sizes" VALUES ('L', 'Large', 10, 6, 4, 2);

INSERT INTO "main_ingredients" ("name") VALUES ('roast beef');
INSERT INTO "main_ingredients" ("name") VALUES ('ham');
INSERT INTO "main_ingredients" ("name") VALUES ('bacon');

INSERT INTO "breads" ("name") VALUES ('wheat');
INSERT INTO "breads" ("name") VALUES ('brown');

INSERT INTO "optional_ingredients" ("name") VALUES ('lettuce');
INSERT INTO "optional_ingredients" ("name") VALUES ('olives');
INSERT INTO "optional_ingredients" ("name") VALUES ('onions');
INSERT INTO "optional_ingredients" ("name") VALUES ('cucumber');
INSERT INTO "optional_ingredients" ("name") VALUES ('yellow cheese');
INSERT INTO "optional_ingredients" ("name") VALUES ('tomatoes');
INSERT INTO "optional_ingredients" ("name") VALUES ('mozzarella');

INSERT INTO "dressings" ("name") VALUES ('olive oil');
INSERT INTO "dressings" ("name") VALUES ('mustard');
INSERT INTO "dressings" ("name") VALUES ('mayonnaise');

COMMIT;
