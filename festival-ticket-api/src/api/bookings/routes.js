const { default: mod } = require('@hapi/jwt');
const config = require('../../utils/config');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/bookings',
    handler: (request, h) => handler.postBookingHandler(request, h),
    options: {
      auth: config.application.authenticationName,
    },
  },
  {
    method: 'GET',
    path: '/bookings/confirms/{confirmationCode}',
    handler: (request, h) => handler.getBookingConfirmHandler(request, h),
    options: {
      auth: config.application.authenticationName,
    },
  },
  {
    method: 'GET',
    path: '/bookings/{id}',
    handler: (request, h) => handler.getBookingByIdHandler(request, h),
    options: {
      auth: config.application.authenticationName,
    },
  },
  {
    method: 'DELETE',
    path: '/bookings/{id}',
    handler: (request, h) => handler.deleteBookingByIdHandler(request, h),
    options: {
      auth: config.application.authenticationName,
    },
  },
];

module.exports = routes;
