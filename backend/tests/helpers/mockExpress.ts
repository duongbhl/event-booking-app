export const createMockRequest = (body: Record<string, unknown> = {}) =>
  ({
    body,
  }) as any;

export const createMockResponse = () => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};
