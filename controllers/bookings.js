const assert = require('assert');

const { UserAppKey } = require('../models/index');
const { typeDefs: productTypeDefs, query: productQuery } = require('./graphql-schemas/product');
const { typeDefs: availTypeDefs, query: availQuery } = require('./graphql-schemas/availability');
const { typeDefs: bookingTypeDefs, query: bookingQuery } = require('./graphql-schemas/booking');
const { typeDefs: rateTypeDefs, query: rateQuery } = require('./graphql-schemas/rate');
const { typeDefs: pickupTypeDefs, query: pickupQuery } = require('./graphql-schemas/pickup-point');

const typeDefsAndQueries = {
  productTypeDefs,
  productQuery,
  availTypeDefs,
  availQuery,
  bookingTypeDefs,
  bookingQuery,
  rateTypeDefs,
  rateQuery,
  pickupTypeDefs,
  pickupQuery,
};

const bookingsSearch = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    const userAppKeys = await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    });
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    const search = (app.searchHotelBooking || app.searchBooking).bind(app);
    const results = await search({
      axios,
      token,
      payload: body,
      typeDefsAndQueries,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const bookingsCancel = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    const results = await app.cancelBooking({
      axios,
      token,
      payload: body,
      typeDefsAndQueries,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const $bookingsProductSearch = plugins => async ({
  axios,
  appKey,
  userId,
  hint,
  payload,
  requestId,
}) => {
  const app = plugins.find(({ name }) => name === appKey);
  // const app = load(appKey);
  const userAppKeys = (await UserAppKey.findOne({
    where: {
      userId,
      integrationId: appKey,
      ...(hint ? { hint } : {}),
    },
  }));
  assert(userAppKeys, 'could not find the app key');
  const token = await userAppKeys.token;
  const results = await app.searchProducts({
    axios,
    token,
    payload,
    typeDefsAndQueries,
    requestId,
  });
  return results;
};

const bookingsProductSearch = plugins => async (req, res, next) => {
  const {
    axios,
    params,
    body: payload,
    requestId,
  } = req;
  try {
    return res.json(await $bookingsProductSearch(plugins)({
      axios,
      ...params,
      payload,
      requestId,
    }));
  } catch (err) {
    return next(err);
  }
};

const bookingsAvailabilitySearch = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    const results = await app.searchAvailability({
      axios,
      token,
      payload,
      typeDefsAndQueries,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const $bookingsAvailabilityCalendar = plugins => async ({
  axios,
  appKey,
  userId,
  hint,
  payload,
  requestId,
}) => {
  const app = plugins.find(({ name }) => name === appKey);
  // const app = load(appKey);
  const userAppKeys = (await UserAppKey.findOne({
    where: {
      userId,
      integrationId: appKey,
      ...(hint ? { hint } : {}),
    },
  }));
  assert(userAppKeys, 'could not find the app key');
  const token = await userAppKeys.token;
  return app.availabilityCalendar({
    axios,
    token,
    payload,
    typeDefsAndQueries,
    requestId,
  });
};

const bookingsAvailabilityCalendar = plugins => async (req, res, next) => {
  const {
    axios,
    params,
    body: payload,
    requestId,
  } = req;
  try {
    return res.json(await $bookingsAvailabilityCalendar(plugins)({
      axios,
      ...params,
      payload,
      requestId,
    }));
  } catch (err) {
    return next(err);
  }
};

const searchQuote = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    assert(payload.id, 'the availability id is required');
    const results = await app.searchQuote({
      axios,
      token,
      payload,
      typeDefsAndQueries,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const createBooking = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    assert(payload.id, 'the quote id is required');
    const results = await app.createBooking({
      axios,
      token,
      payload,
      typeDefsAndQueries,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const getAffiliateAgents = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    assert(app.getAffiliateAgents, `getAffiliateAgents is not available for ${appKey}`);
    const results = await app.getAffiliateAgents({
      axios,
      token,
      payload,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const getAffiliateDesks = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    assert(app.getAffiliateDesks, `getAffiliateDesks is not available for ${appKey}`);
    const results = await app.getAffiliateDesks({
      axios,
      token,
      payload,
      requestId: req.requestId,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const getPickupPoints = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    assert(app.getPickupPoints, `getPickupPoints is not available for ${appKey}`);
    const results = await app.getPickupPoints({
      axios,
      token,
      payload,
      typeDefsAndQueries,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

const getCreateBookingFields = plugins => async (req, res, next) => {
  const {
    axios,
    params: { appKey, userId, hint },
    body: payload,
  } = req;
  try {
    const app = plugins.find(({ name }) => name === appKey);
    // const app = load(appKey);
    const userAppKeys = (await UserAppKey.findOne({
      where: {
        userId,
        integrationId: appKey,
        ...(hint ? { hint } : {}),
      },
    }));
    assert(userAppKeys, 'could not find the app key');
    const token = await userAppKeys.token;
    assert(app.getCreateBookingFields, `getCreateBookingFields is not available for ${appKey}`);
    const results = await app.getCreateBookingFields({
      axios,
      token,
      payload,
      typeDefsAndQueries,
    });
    return res.json(results);
  } catch (err) {
    return next(err);
  }
};

module.exports = plugins => ({
  bookingsSearch: bookingsSearch(plugins),
  bookingsCancel: bookingsCancel(plugins),
  $bookingsProductSearch,
  bookingsProductSearch: bookingsProductSearch(plugins),
  bookingsAvailabilitySearch: bookingsAvailabilitySearch(plugins),
  $bookingsAvailabilityCalendar,
  bookingsAvailabilityCalendar: bookingsAvailabilityCalendar(plugins),
  searchQuote: searchQuote(plugins),
  createBooking: createBooking(plugins),
  getAffiliateAgents: getAffiliateAgents(plugins),
  getAffiliateDesks: getAffiliateDesks(plugins),
  getPickupPoints: getPickupPoints(plugins),
  getCreateBookingFields: getCreateBookingFields(plugins),
});
