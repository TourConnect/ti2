const jwt = require('jwt-promise');
const { omit } = require('ramda');
const assert = require('assert');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const Sequelize = require('sequelize');
const fs = require('fs').promises;

const sqldb = require('../models');

const { env: { jwtSecret } } = process;

const jwtEncode = async (req, res, next) => {
  try {
    const value = await jwt.sign(req.body, `${req.appRecord.name}.${jwtSecret}`);
    return res.json({ value });
  } catch (err) {
    return next(err);
  }
};

const createAppToken = async (req, res, next) => {
  const {
    body: {
      tokenHint: hint,
      token: appKey,
    },
    params: {
      app: integrationId,
      userId,
    },
  } = req;
  try {
    const payload = {
      integrationId,
      userId,
      hint,
      appKey,
    };
    // check if the user exists
    const userRecord = await sqldb.User.findOne({ where: { userId } });
    if (!userRecord) { // create the user record
      await sqldb.User.create({ userId });
    }
    // check if the user alrady has the same app with the same hint
    const userAppKeyDup = await sqldb.UserAppKey.findOne({
      where: { userId, integrationId, hint },
    });
    if (userAppKeyDup) await userAppKeyDup.destroy();
    const newAppKey = await sqldb.UserAppKey.create(payload);
    return res.json({ value: newAppKey.get('id').toString() });
  } catch (err) {
    return next(err);
  }
};

const deleteAppToken = async (req, res, next) => {
  const {
    body: {
      tokenHint: hint,
    },
    params: {
      app: integrationId,
      userId,
    },
  } = req;
  // check if the user exists
  const userRecord = await sqldb.User.findOne({ where: { userId } });
  if (!userRecord) return next({ status: 404, message: 'User does not exists' });
  const retVal = await sqldb.UserAppKey.destroy({
    where: {
      integrationId,
      userId,
      hint,
    },
  });
  if (retVal === 0) return next({ status: 404, message: 'Key not found' });
  return res.json({ message: `${retVal} erased` });
};

const listAppTokens = async (req, res, next) => {
  const { params: { app: integrationId } } = req;
  try {
    const userAppKeys = (await sqldb.UserAppKey.findAll({ where: { integrationId } }))
      .map(userAppKey => userAppKey.dataValues);
    return res.json({ userAppKeys: userAppKeys.map(userAppKey => omit(['appKey', 'id'], userAppKey)) });
  } catch (err) {
    return next(err);
  }
};

const migrateApp = async ({ integrationId, action }) => {
  const { sequelize } = sqldb;
  assert(integrationId);
  assert(action);
  const migrationsPath = path.join(
    __dirname,
    '../',
    '../',
    `ti2-${integrationId}`,
    'migrations',
  );
  try {
    await fs.access(migrationsPath);
  } catch (err) {
    throw Error(`Could not find any migrations for ${integrationId} on ${migrationsPath}`);
  }
  const umzug = new Umzug({
    migrations: {
      glob: `${migrationsPath}/*.js`,
      // inject sequelize's QueryInterface in the migrations
      resolve: ({ name, path: migPath, context }) => {
        const migration = require(migPath);
        return {
          // adjust the parameters Umzug will
          // pass to migration methods when called
          name,
          up: async () => migration.up(context, Sequelize),
          down: async () => migration.down(context, Sequelize),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize,
      tableName: `SequelizeMeta-${integrationId}`,
    }),
    logger: console,
  });
  if (action === 'migrate') {
    return umzug.up();
  }
  if (action === 'revert') {
    return umzug.down({ to: 0 });
  }
  throw Error('No recognized action');
};

module.exports = {
  jwtEncode,
  createAppToken,
  deleteAppToken,
  listAppTokens,
  migrateApp,
};
