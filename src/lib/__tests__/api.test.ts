// Provide a manual mock for axios before importing modules that use it.
jest.mock("axios", () => {
  const m: any = {
    create: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  m.create.mockReturnValue(m);
  return m;
});

import axios from "axios";
import { checkApiHealth, refreshAccessToken } from "@/lib/api";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("api helpers", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("checkApiHealth returns healthy when GET /health returns 200", async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.get.mockResolvedValue({ status: 200, data: { ok: true } });

    const res = await checkApiHealth();
    expect(res.isHealthy).toBe(true);
    expect(res.message).toMatch(/API is healthy/);
    expect(mockedAxios.get).toHaveBeenCalledWith("/health", { timeout: 3000 });
  });

  test("checkApiHealth returns not healthy when request fails", async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.get.mockRejectedValue(new Error("Network error"));

    const res = await checkApiHealth();
    expect(res.isHealthy).toBe(false);
    expect(res.message).toMatch(/API is not available/);
  });

  test("refreshAccessToken calls POST /auth/refresh and returns data", async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.post.mockResolvedValue({ data: { accessToken: "new-token" } });

    const data = await refreshAccessToken();
    expect(data).toEqual({ accessToken: "new-token" });
    expect(mockedAxios.post).toHaveBeenCalledWith("/auth/refresh");
  });

  test("ratingAPI.submitRating returns response data on success", async () => {
    // lazy import ratingAPI from module (module already imported by api.ts)
    const { ratingAPI } = await import("@/lib/api");
    mockedAxios.create.mockReturnValue(mockedAxios);
    const payload = {
      sessionId: 1,
      tutorId: "t1",
      rating: 5,
      comment: "Great",
    };
    mockedAxios.post.mockResolvedValue({
      data: { success: true, data: { message: "Submitted" } },
    });

    const res = await ratingAPI.submitRating(payload);
    expect(res).toEqual({ success: true, data: { message: "Submitted" } });
    expect(mockedAxios.post).toHaveBeenCalledWith("ratings", payload);
  });

  test("ratingAPI.submitRating returns fallback on error", async () => {
    const { ratingAPI } = await import("@/lib/api");
    mockedAxios.create.mockReturnValue(mockedAxios);
    const payload = { sessionId: 2, tutorId: "t2", rating: 4 };
    mockedAxios.post.mockRejectedValue(new Error("Network error"));

    const res = await ratingAPI.submitRating(payload as any);
    expect(res).toEqual({
      success: false,
      data: { message: "Failed to submit rating" },
      error: "Network error",
    });
    expect(mockedAxios.post).toHaveBeenCalledWith("ratings", payload);
  });
});
