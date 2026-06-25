import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../src/models/user.model";
import { forgotPassword, login, register } from "../src/controllers/auth.controller";
import { generateToken } from "../src/utils/generateToken";
import { sendEmail } from "../src/utils/sendEmail";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

jest.mock("../src/models/user.model", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
  compare: jest.fn(),
}));

jest.mock("../src/utils/generateToken", () => ({
  generateToken: jest.fn(),
}));

jest.mock("../src/utils/sendEmail", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

const mockedUser = User as jest.Mocked<typeof User>;
const mockedValidationResult = validationResult as unknown as jest.Mock;
const mockedGenerateToken = generateToken as jest.Mock;
const mockedSendEmail = sendEmail as jest.Mock;
const mockedBcryptCompare = bcrypt.compare as jest.Mock;

describe("auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
    mockedGenerateToken.mockReturnValue("fake-jwt-token");
  });

  it("registers a new user and returns auth payload", async () => {
    const req = createMockRequest({
      name: "Demo User",
      email: "demo@example.com",
      password: "secret123",
    });
    const res = createMockResponse();

    mockedUser.findOne.mockResolvedValue(null as never);
    mockedUser.create.mockResolvedValue({
      _id: "user-id-1",
      name: "Demo User",
      email: "demo@example.com",
      role: "user",
      notificationsEnabled: true,
    } as never);

    await register(req, res);

    expect(mockedUser.findOne).toHaveBeenCalledWith({ email: "demo@example.com" });
    expect(mockedUser.create).toHaveBeenCalledWith({
      name: "Demo User",
      email: "demo@example.com",
      password: "secret123",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "user-id-1",
        email: "demo@example.com",
        token: "fake-jwt-token",
      })
    );
  });

  it("returns 400 when registering an existing email", async () => {
    const req = createMockRequest({
      name: "Demo User",
      email: "demo@example.com",
      password: "secret123",
    });
    const res = createMockResponse();

    mockedUser.findOne.mockResolvedValue({ _id: "existing-user" } as never);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already used" });
  });

  it("logs in successfully with valid credentials", async () => {
    const req = createMockRequest({
      email: "demo@example.com",
      password: "secret123",
    });
    const res = createMockResponse();

    const select = jest.fn().mockResolvedValue({
      _id: "user-id-2",
      name: "Demo User",
      email: "demo@example.com",
      password: "hashed-password",
      role: "user",
      notificationsEnabled: true,
    });

    mockedUser.findOne.mockReturnValue({ select } as never);
    mockedBcryptCompare.mockResolvedValue(true);

    await login(req, res);

    expect(mockedUser.findOne).toHaveBeenCalledWith({ email: "demo@example.com" });
    expect(select).toHaveBeenCalledWith("+password");
    expect(mockedBcryptCompare).toHaveBeenCalledWith("secret123", "hashed-password");
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "demo@example.com",
        token: "fake-jwt-token",
      })
    );
  });

  it("returns 404 when login email is not found", async () => {
    const req = createMockRequest({
      email: "missing@example.com",
      password: "secret123",
    });
    const res = createMockResponse();

    const select = jest.fn().mockResolvedValue(null);
    mockedUser.findOne.mockReturnValue({ select } as never);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("sends a reset email when forgotPassword receives an existing account", async () => {
    const req = createMockRequest({
      email: "demo@example.com",
    });
    const res = createMockResponse();

    const save = jest.fn().mockResolvedValue(undefined);
    const select = jest.fn().mockResolvedValue({
      email: "demo@example.com",
      passwordResetCode: null,
      passwordResetExpires: null,
      save,
    });

    mockedUser.findOne.mockReturnValue({ select } as never);
    mockedSendEmail.mockResolvedValue(undefined);

    await forgotPassword(req, res);

    expect(mockedUser.findOne).toHaveBeenCalledWith({ email: "demo@example.com" });
    expect(save).toHaveBeenCalled();
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "demo@example.com",
        subject: "Password reset code",
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "If the email exists, a reset code has been sent",
    });
  });
});
