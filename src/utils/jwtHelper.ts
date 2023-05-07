import JWT from "jsonwebtoken";
import { decrypt, encrypt } from "utils/encryptionHelper";
import { ExpiredJWTPayload, JWTPayload } from "types/jwt";

export function createJWTToken(payload: any, expiresIn: string = "3h") {
  return encrypt(
    JWT.sign({ payload }, process.env.JWT_KEY as string, { expiresIn }),
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string,
  );
}

export function verifyJWTToken<T = any>(
  token: string,
): JWTPayload<T> | ExpiredJWTPayload {
  try {
    return {
      ...(JWT.verify(
        decrypt(token, process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string),
        process.env.JWT_KEY as string,
      ) as JWTPayload<T>),
      isExpired: false,
    };
  } catch (error) {
    return {
      iat: 0,
      exp: 0,
      isExpired: true,
    };
  }
}
