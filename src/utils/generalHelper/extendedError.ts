class ExtendedError extends Error {
  public extendedMessage?: string;
  public code?: number;
  public category?: string;
  public reason?: string;

  constructor(
    msg: string,
    code: number,
    category: string,
    reason: string,
  ) {
    super(msg);
    this.extendedMessage = msg;
    this.code = code;
    this.category = category;
    this.reason = reason;
  }
}

export default ExtendedError;
