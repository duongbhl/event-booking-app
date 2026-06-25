import Event from "../src/models/event.model";
import { createEvent } from "../src/controllers/event.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

jest.mock("../src/models/event.model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

const mockedEvent = Event as jest.Mocked<typeof Event>;

describe("event.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when ticket tiers are missing", async () => {
    const req = {
      ...createMockRequest({
        title: "Tech Meetup",
        category: "Technology",
        date: "2026-07-10",
        location: "Ho Chi Minh City",
      }),
      user: { _id: "organizer-1" },
    } as any;
    const res = createMockResponse();

    await createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "At least one ticket tier is required",
    });
  });

  it("creates an event successfully with normalized ticket tiers", async () => {
    const req = {
      ...createMockRequest({
        title: "Tech Meetup",
        description: "Meetup for developers",
        category: "Technology",
        price: 0,
        date: "2026-07-10T00:00:00.000Z",
        time: "18:30",
        member: 10,
        location: "Ho Chi Minh City",
        images: "https://example.com/image.png",
        ticketTiers: [
          { name: "Standard", price: 0, quota: 100 },
          { name: "VIP", price: 199000, quota: 20 },
        ],
      }),
      user: { _id: "organizer-1" },
    } as any;
    const res = createMockResponse();

    mockedEvent.create.mockResolvedValue({
      _id: "event-1",
      title: "Tech Meetup",
    } as never);

    await createEvent(req, res);

    expect(mockedEvent.create).toHaveBeenCalledWith({
      title: "Tech Meetup",
      description: "Meetup for developers",
      category: "Technology",
      price: 0,
      date: new Date("2026-07-10T00:00:00.000Z"),
      time: "18:30",
      member: 10,
      location: "Ho Chi Minh City",
      images: "https://example.com/image.png",
      organizer: "organizer-1",
      status: "upcoming",
      approvalStatus: "PENDING",
      ticketTiers: [
        { name: "Standard", price: 0, quota: 100, sold: 0 },
        { name: "VIP", price: 199000, quota: 20, sold: 0 },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: "event-1",
      title: "Tech Meetup",
    });
  });
});
