const ForbiddenError = require('../../exceptions/ForbiddenError');
const InvariantError = require('../../exceptions/InvariantError');

class BookingsHandler {
  constructor(bookingsService, festivalsService, queueService, validator) {
    this._bookingsService = bookingsService;
    this._festivalsService = festivalsService;
    this._queueService = queueService;
    this._validator = validator;
  }

  async postBookingHandler(request, h) {
    // get user id from request.auth.credentials
    const { id: userId } = request.auth.credentials;
    // validate the payload
    // if the payload is not valid, then the val idator will throw an error
    // if the payload is valid, then the validator will return the payload
    const { festivalId, quantity, bookingDate } =
      this._validator.validatePostBookingPayload(request.payload);
    // check if the festival is available
    const isFestivalAvailable =
      await this._festivalsService.isFestivalAvailable(festivalId);
    // if the festival is not available, then throw an error
    if (!isFestivalAvailable) {
      throw new InvariantError('festival tidak valid');
    }

    const bookingId = await this._bookingsService.persistBooking({
      userId,
      festivalId,
      quantity,
      bookingDate,
    });

    const queueMessage = JSON.stringify({ bookingId });

    await this._queueService.sendMessage(
      'booking:send_confirmation',
      queueMessage,
    );

    return h
      .response({
        status: 'success',
        message: 'konfirmasi booking akan dikirimkan melalui email',
        data: {
          bookingId,
        },
      })
      .code(201);
  }

  async getBookingConfirmHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { confirmationCode } = request.params;

    const owner = await this._bookingsService.getUserIdByConfirmationCode(
      confirmationCode,
    );

    if (owner !== userId) {
      throw new ForbiddenError('anda tidak berhak mengakses resource ini');
    }

    const booking = await this._bookingsService.confirmBooking(
      confirmationCode,
    );

    return {
      status: 'success',
      data: {
        booking,
      },
    };
  }

  async getBookingByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: bookingId } = request.params;

    const owner = await this._bookingsService.getUserIdByBookingId(bookingId);

    if (owner !== userId) {
      throw new ForbiddenError('anda tidak berhak mengakses resource ini');
    }

    const booking = await this._bookingsService.getBookingById(bookingId);

    const response = h.response({
      status: 'success',
      message: 'booking berhasil ditemukan',
      data: {
        booking,
      },
    });

    return response;
  }

  async deleteBookingByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { id: bookingId } = request.params;

    const owner = await this._bookingsService.getUserIdByBookingId(bookingId);

    if (owner !== userId) {
      throw new ForbiddenError('anda tidak berhak mengakses resource ini');
    }

    await this._bookingsService.cancelBooking(bookingId);

    await this._queueService.sendMessage(
      'booking:delete',
      JSON.stringify({ bookingId }),
    );

    return {
      status: 'success',
      message: 'booking berhasil dihapus',
      data: {},
    };
  }
}

module.exports = BookingsHandler;
