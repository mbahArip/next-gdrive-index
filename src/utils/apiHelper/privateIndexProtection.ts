import { NextRequest } from "next/server";

import ExtendedError from "utils/extendedError";
import { checkPathPassword } from "utils/passwordHelper";

import { Constant } from "types/constant";

export default async function privateIndexProtection(
  request: NextRequest,
) {
  const cookies = request.cookies.get(
    Constant.cookies_SitePassword,
  );
  if (!cookies) {
    throw new ExtendedError(
      "Unauthorized",
      401,
      "No password found",
    );
  }

  const password = cookies.value;
  const sitePassword =
    process.env.NEXT_PUBLIC_SITE_PASSWORD;
  console.log(sitePassword);
  if (!sitePassword) {
    throw new ExtendedError(
      "Internal Server Error",
      500,
      "Can't find site password. Please check your environment variable",
    );
  }
  const valid = checkPathPassword(
    "site-wide",
    password,
    sitePassword,
  );
  if (!valid) {
    throw new ExtendedError(
      "Unauthorized",
      401,
      "Invalid password",
    );
  }
}
