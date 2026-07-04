BEGIN TRANSACTION;

INSERT INTO "orders" VALUES (1, 1, 12.0, 'confirmed');
INSERT INTO "orders" VALUES (2, 1, 20.0, 'confirmed');
INSERT INTO "orders" VALUES (3, 1, 6.5, 'confirmed');
INSERT INTO "orders" VALUES (4, 2, 20.0, 'confirmed');
INSERT INTO "orders" VALUES (5, 2, 15.0, 'confirmed');
INSERT INTO "orders" VALUES (6, 2, 9.1, 'confirmed');

INSERT INTO "order_sandwiches" VALUES (1, 1, 'S', 1, 1, 1, 5.0);
INSERT INTO "order_sandwiches" VALUES (2, 1, 'M', 2, 2, 1, 7.0);
INSERT INTO "order_sandwiches" VALUES (3, 2, 'L', 3, 1, 2, 10.0);
INSERT INTO "order_sandwiches" VALUES (4, 3, 'S', 2, 1, 1, 6.5);
INSERT INTO "order_sandwiches" VALUES (5, 4, 'M', 1, 2, 1, 7.0);
INSERT INTO "order_sandwiches" VALUES (6, 4, 'L', 3, 2, 1, 13.0);
INSERT INTO "order_sandwiches" VALUES (7, 5, 'S', 2, 1, 3, 5.0);
INSERT INTO "order_sandwiches" VALUES (8, 6, 'M', 1, 1, 1, 9.1);

INSERT INTO "order_sandwich_ingredients" VALUES (1, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (1, 2);
INSERT INTO "order_sandwich_ingredients" VALUES (2, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (2, 5);
INSERT INTO "order_sandwich_ingredients" VALUES (2, 6);
INSERT INTO "order_sandwich_ingredients" VALUES (3, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (3, 2);
INSERT INTO "order_sandwich_ingredients" VALUES (3, 5);
INSERT INTO "order_sandwich_ingredients" VALUES (3, 7);
INSERT INTO "order_sandwich_ingredients" VALUES (4, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (4, 2);
INSERT INTO "order_sandwich_ingredients" VALUES (4, 3);
INSERT INTO "order_sandwich_ingredients" VALUES (5, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (5, 4);
INSERT INTO "order_sandwich_ingredients" VALUES (5, 6);
INSERT INTO "order_sandwich_ingredients" VALUES (6, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (6, 2);
INSERT INTO "order_sandwich_ingredients" VALUES (6, 5);
INSERT INTO "order_sandwich_ingredients" VALUES (6, 6);
INSERT INTO "order_sandwich_ingredients" VALUES (6, 7);
INSERT INTO "order_sandwich_ingredients" VALUES (7, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (7, 6);
INSERT INTO "order_sandwich_ingredients" VALUES (8, 1);
INSERT INTO "order_sandwich_ingredients" VALUES (8, 2);
INSERT INTO "order_sandwich_ingredients" VALUES (8, 5);
INSERT INTO "order_sandwich_ingredients" VALUES (8, 7);

INSERT INTO "order_sandwich_dressings" VALUES (1, 1);
INSERT INTO "order_sandwich_dressings" VALUES (2, 2);
INSERT INTO "order_sandwich_dressings" VALUES (2, 3);
INSERT INTO "order_sandwich_dressings" VALUES (3, 1);
INSERT INTO "order_sandwich_dressings" VALUES (3, 2);
INSERT INTO "order_sandwich_dressings" VALUES (4, 3);
INSERT INTO "order_sandwich_dressings" VALUES (5, 1);
INSERT INTO "order_sandwich_dressings" VALUES (6, 2);
INSERT INTO "order_sandwich_dressings" VALUES (6, 3);
INSERT INTO "order_sandwich_dressings" VALUES (7, 2);
INSERT INTO "order_sandwich_dressings" VALUES (8, 1);
INSERT INTO "order_sandwich_dressings" VALUES (8, 3);

UPDATE "users" SET "balance" = 61.5 WHERE "id" = 1;
UPDATE "users" SET "balance" = 55.9 WHERE "id" = 2;

COMMIT;
