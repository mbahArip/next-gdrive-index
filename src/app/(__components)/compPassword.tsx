"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import passwordHash from "utils/encryptionHelper/passwordHash";

import { Constant } from "types/general/constant";

function Password({
  path,
  redirect,
}: {
  path: string;
  redirect: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");

  const handlePasswordSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const isPasswordExists =
      document.cookie.split(Constant.cookiePassword)
        .length > 1;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    if (isPasswordExists) {
      const passwordCookie = document.cookie
        .split(Constant.cookiePassword)[1]
        .split(";")[0]
        .split("=")[1];
      const parsedPassword = JSON.parse(passwordCookie);
      parsedPassword[path] = passwordHash.encode(password);
      document.cookie = `${
        Constant.cookiePassword
      }=${JSON.stringify(
        parsedPassword,
      )}; expires=${expires.toUTCString()}; path=/`;
    } else {
      const parsedPassword = {
        [path]: passwordHash.encode(password),
      };
      document.cookie = `${
        Constant.cookiePassword
      }=${JSON.stringify(
        parsedPassword,
      )}; expires=${expires.toUTCString()}; path=/`;
    }

    router.push(redirect);
  };

  return (
    <div
      className={
        "flex max-w-screen-lg flex-col items-center gap-2"
      }
    >
      <h1 className={"font-semibold"}>
        Password protected
      </h1>
      <p className={"text-center"}>
        The file or folder you are trying to access is
        password protected. Please enter the password to
        continue.
      </p>

      <form
        className={
          "my-8 flex w-full max-w-md flex-col gap-2"
        }
        onSubmit={handlePasswordSubmit}
      >
        <input
          type={"password"}
          className={"input"}
          placeholder={"Password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type={"submit"}
          className={"interactive"}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Password;
