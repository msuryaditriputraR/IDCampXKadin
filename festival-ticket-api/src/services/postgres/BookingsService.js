const { nanoid } = require('nanoid'),
  { createPool } = require('./pool');

class BookingsService {
  constructor() {
    this._pool = createPool();
  }

  async persistBooking({ userId, festivalId, bookingDate, quantity }) {
    const bookingsId = `booking-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO bookings VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      values: [
        bookingsId,
        userId,
        festivalId,
        bookingDate,
        quantity,
        null,
        0,
        new Date(),
        null,
      ],
    };

    await this._pool.query(query);

    return bookingsId;
  }

  async confirmBooking(confirmationCode) {
    const query = {
      text: 'UPDATE bookings SET status = 1 WHERE confirmation_code = $1',
      values: [confirmationCode],
    };

    await this._pool.query(query);
  }

  async cancelBooking(bookingId) {
    const query = {
      text: 'SELECT * FROM bookings WHERE id = $1 AND status = $2',
      values: [bookingId, 0],
    };

    const { rows } = await this._pool.query(query);

    console.log(rows);

    if (!rows.length) return null;

    this.softDeleteBooking(bookingId);
  }

  async getUserIdByConfirmationCode({ confirmationCode }) {
    const query = {
      text: 'SELECT user_id FROM bookings WHERE confirmation_code = $1',
      values: [confirmationCode],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) return null;

    return rows[0].user_id;
  }

  async getUserIdByBookingId(bookingId) {
    const query = {
      text: 'SELECT user_id FROM bookings WHERE id = $1',
      values: [bookingId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) return null;

    return rows[0].user_id;
  }

  async getBookingById(bookingId) {
    const query = {
      text: 'SELECT * FROM bookings WHERE id = $1',
      values: [bookingId],
    };
    const { rows } = await this._pool.query(query);
    const [booking] = rows;

    // delete the confirmation code from the booking object
    delete booking.confirmation_code;
    return booking;
  }

  async softDeleteBooking(bookingId) {
    const query = {
      text: 'UPDATE bookings SET status = -1 WHERE id = $1',
      values: [bookingId],
    };
    await this._pool.query(query);
  }
}

module.exports = BookingsService;
