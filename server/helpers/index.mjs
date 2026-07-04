/**
 * Wrapper around db.all
 */
export const dbAllAsync = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

/**
 * Wrapper around db.get
 */
export const dbGetAsync = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

/**
 * Wrapper around db.run
 * {
    changes: 1, // how many rows were changed (or inserted or deleted)
    lastID: 0   // the last inserted row id (if an insert was performed)
  }
 */
export const dbRunAsync = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
