const { sendEmail } = require('../src/sendEmail');

let mockSend;

jest.mock('resend', () => {
  const mockSendFn = jest.fn();
  const MockResend = jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSendFn,
    },
  }));
  MockResend.mockSendFn = mockSendFn;
  return { Resend: MockResend };
});

const { Resend } = require('resend');

beforeEach(() => {
  mockSend = Resend.mockSendFn;
  mockSend.mockReset();
});

describe('sendEmail', () => {
  test('calls Resend with correct parameters', async () => {
    mockSend.mockResolvedValue({ data: { id: 'abc123' }, error: null });

    await sendEmail({
      apiKey: 're_test',
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Hello world',
      html: '<p>Hello world</p>',
    });

    expect(mockSend).toHaveBeenCalledWith({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Hello world',
      html: '<p>Hello world</p>',
    });
  });

  test('omits html when not provided', async () => {
    mockSend.mockResolvedValue({ data: { id: 'abc123' }, error: null });

    await sendEmail({
      apiKey: 're_test',
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test',
      text: 'Hello',
    });

    const call = mockSend.mock.calls[0][0];
    expect(call.html).toBeUndefined();
  });

  test('throws when Resend returns an error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } });

    await expect(
      sendEmail({
        apiKey: 're_bad',
        from: 'a@b.com',
        to: 'c@d.com',
        subject: 'Hi',
        text: 'Hello',
      })
    ).rejects.toThrow('Invalid API key');
  });

  test('returns data on success', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_xyz' }, error: null });

    const result = await sendEmail({
      apiKey: 're_test',
      from: 'a@b.com',
      to: 'c@d.com',
      subject: 'Hi',
      text: 'Hello',
    });

    expect(result).toEqual({ id: 'msg_xyz' });
  });
});
