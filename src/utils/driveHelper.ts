export const hiddenFiles = [".password", ".readme.md", ".banner"];

export class ExtendedError extends Error {
  code?: number;

  constructor(message?: string, code?: number, reason?: string) {
    super(message);
    this.code = code;
    this.cause = reason;
  }
}
