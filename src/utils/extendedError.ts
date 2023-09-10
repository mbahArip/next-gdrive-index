class ExtendedError extends Error {
  public extendedMessage?: string;
  public code?: number;
  public reason?: string;

  constructor(msg: string, code: number, reason: string) {
    super(msg);
    this.extendedMessage = msg;
    this.code = code;
    this.reason = reason;
  }
}

export default ExtendedError;
