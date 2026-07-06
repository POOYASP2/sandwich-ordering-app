/* Data Access Object (DAO) module for accessing users data */

import db from './db.mjs';
import crypto from 'crypto';
import { dbGetAsync, dbRunAsync } from './helpers/index.mjs';

// This function is used at log-in time to verify username and password.
const getUser = async (email, password) => {
  const sql = 'SELECT * FROM users WHERE email=?';
  const row = await dbGetAsync(db, sql, [email]);

  if (row === undefined) {
    return false;
  } else {
    const user = {
      id: row.id,
      username: row.email,
      email: row.email,
      name: row.name,
      secret: row.secret,
      lastTotpStep: row.lastTotpStep,
    };

    return new Promise((resolve, reject) => {
      crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
        if (err) reject(err);
        if (
          !crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)
        )
          resolve(false);
        else resolve(user);
      });
    });
  }
};

// This function updates the lastTotpStep for the user in the database.
const updateLastTotpStep = async (userId, lastTotpStep) => {
  const sql = 'UPDATE users SET lastTotpStep = ? WHERE id = ?';
  const result = await dbRunAsync(db, sql, [lastTotpStep, userId]);

  if (result.changes !== 1) {
    return { error: 'User not found.' };
  } else {
    return result.changes;
  }
};

// This function returns the user's public information.
const getUserById = async (userId) => {
  const sql = 'SELECT id, email, name, balance FROM users WHERE id=?';
  const row = await dbGetAsync(db, sql, [userId]);

  if (row === undefined) {
    return false;
  } else {
    return {
      id: row.id,
      username: row.email,
      name: row.name,
      balance: row.balance,
    };
  }
};

export default {
  getUser,
  updateLastTotpStep,
  getUserById,
};
