const BookingsHandler = require('./handler'),
  BookingsValidator = require('./validator'),
  routes = require('./routes');

const bookings = {
  name: 'bookings',
  version: '1.0.0',
  register: async (
    server,
    { bookingsService, festivalsService, queueService },
  ) => {
    const bookingsHandler = new BookingsHandler(
      bookingsService,
      festivalsService,
      queueService,
      BookingsValidator,
    );

    server.route(routes(bookingsHandler));
  },
};

module.exports = bookings;
