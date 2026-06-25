import Event from "../src/models/event.model";
import Ticket from "../src/models/ticket.model";
import Payment from "../src/models/payment.model";
import User from "../src/models/user.model";
import Notification from "../src/models/notification.model";
import { confirmPayment, bookTicket } from "../src/controllers/ticket.controller";
import { generateTicketQRCode } from "../src/utils/generateQRCode";
import { sendPushNotification } from "../src/utils/pushNotification";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

jest.mock("../src/models/event.model", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("../src/models/ticket.model", () => ({
  __esModule: true,
  default: {
    insertMany: jest.fn(),
    updateMany: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("../src/models/payment.model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../src/models/user.model", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock("../src/models/notification.model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock("../src/utils/generateQRCode", () => ({
  generateTicketQRCode: jest.fn(),
  parseQRCodeData: jest.fn(),
}));

jest.mock("../src/utils/pushNotification", () => ({
  sendPushNotification: jest.fn(),
}));

const mockedEvent = Event as jest.Mocked<typeof Event>;
const mockedTicket = Ticket as jest.Mocked<typeof Ticket>;
const mockedPayment = Payment as jest.Mocked<typeof Payment>;
const mockedUser = User as jest.Mocked<typeof User>;
const mockedNotification = Notification as jest.Mocked<typeof Notification>;
const mockedGenerateTicketQRCode = generateTicketQRCode as jest.Mock;
const mockedSendPushNotification = sendPushNotification as jest.Mock;

describe("ticket.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when booking tickets with invalid price", async () => {
    const req = {
      ...createMockRequest({
        eventId: "event-1",
        tierName: "VIP",
        quantity: 2,
        price: 1000,
      }),
      user: { _id: "user-1" },
    } as any;
    const res = createMockResponse();

    mockedEvent.findById.mockResolvedValue({
      _id: "event-1",
      ticketTiers: [{ name: "VIP", price: 200000, quota: 10, sold: 3 }],
    } as never);

    await bookTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid ticket price" });
  });

  it("books tickets and creates a pending payment successfully", async () => {
    const req = {
      ...createMockRequest({
        eventId: "event-1",
        tierName: "VIP",
        quantity: 2,
        price: 400000,
        seatInfo: "A",
        method: "wallet",
      }),
      user: { _id: "user-1" },
    } as any;
    const res = createMockResponse();

    mockedEvent.findById.mockResolvedValue({
      _id: "event-1",
      ticketTiers: [{ name: "VIP", price: 200000, quota: 10, sold: 3 }],
    } as never);
    mockedTicket.insertMany.mockResolvedValue([
      { _id: "ticket-1" },
      { _id: "ticket-2" },
    ] as never);
    mockedPayment.create.mockResolvedValue({
      _id: "payment-1",
      amount: 400000,
      status: "pending",
    } as never);

    await bookTicket(req, res);

    expect(mockedTicket.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        user: "user-1",
        event: "event-1",
        ticketType: "VIP",
        tierName: "VIP",
        price: 200000,
        seatInfo: "A-1",
        paymentStatus: "pending",
      }),
      expect.objectContaining({
        seatInfo: "A-2",
      }),
    ]);
    expect(mockedPayment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        event: "event-1",
        tickets: ["ticket-1", "ticket-2"],
        amount: 400000,
        method: "wallet",
        status: "pending",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("confirms a successful payment and updates tickets, event, and notifications", async () => {
    const req = {
      ...createMockRequest({
        paymentId: "payment-1",
        success: true,
      }),
      user: { _id: "user-1" },
    } as any;
    const res = createMockResponse();

    const paymentDoc = {
      _id: "payment-1",
      user: "user-1",
      event: "event-1",
      tickets: ["ticket-1", "ticket-2"],
      status: "pending",
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockedPayment.findById.mockResolvedValue(paymentDoc as never);
    mockedTicket.updateMany.mockResolvedValue({} as never);
    mockedTicket.find
      .mockResolvedValueOnce([
        { _id: "ticket-1", tierName: "VIP" },
        { _id: "ticket-2", tierName: "VIP" },
      ] as never);
    mockedEvent.findByIdAndUpdate
      .mockResolvedValueOnce({
        ticketTiers: [{ name: "VIP", sold: 5 }],
      } as never)
      .mockResolvedValueOnce({
        _id: "event-1",
        member: 5,
      } as never);
    mockedUser.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        expoPushToken: "ExpoPushToken[demo]",
        name: "Demo User",
      }),
    } as never);
    mockedEvent.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        title: "Tech Meetup",
      }),
    } as never);
    mockedNotification.create.mockResolvedValue({} as never);
    mockedGenerateTicketQRCode.mockResolvedValue("qr-data");
    mockedTicket.findByIdAndUpdate.mockResolvedValue({} as never);

    const populatedTickets = [{ _id: "ticket-1" }, { _id: "ticket-2" }];
    mockedTicket.find.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(populatedTickets),
    } as never);

    await confirmPayment(req, res);

    expect(paymentDoc.status).toBe("success");
    expect(paymentDoc.save).toHaveBeenCalled();
    expect(mockedTicket.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ["ticket-1", "ticket-2"] } },
      { paymentStatus: "paid" }
    );
    expect(mockedSendPushNotification).toHaveBeenCalled();
    expect(mockedNotification.create).toHaveBeenCalled();
    expect(mockedGenerateTicketQRCode).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({
      payment: paymentDoc,
      tickets: populatedTickets,
    });
  });
});
