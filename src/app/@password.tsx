"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/utils";

import { CheckSitePassword, SetSitePassword } from "./actions";

type Props = {
  path: string;
  errorMessage?: string;
};
export default function Password({ path, errorMessage }: Props) {
  const router = useRouter();

  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("Checking password...", {
      id: "password",
    });

    try {
      if (!input) throw new Error("Password is required");
      const set = await SetSitePassword(input);
      if (!set.success) throw new Error(set.message);

      const check = await CheckSitePassword();
      if (!check.success) throw new Error(check.message);

      toast.success("Password accepted! Refreshing...", {
        id: "password",
      });
      router.refresh();
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: "password",
      });
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto h-full w-full max-w-md",
        "flex flex-grow flex-col items-center justify-center gap-3",
      )}
    >
      <img
        src='/images/undraw_vault.svg'
        alt='Password illustration'
        loading='eager'
        className={cn("h-48 w-64 object-contain")}
      />
      <div className='flex flex-col items-center justify-center'>
        <h3 className='text-pretty text-center'>
          {path === "global"
            ? "This site are password protected"
            : "The folder or file you are trying to access is password protected"}
        </h3>
        <span className='muted text-pretty text-center'>
          Please enter the password to access the content
        </span>
      </div>

      <form
        className={cn("w-full", "grid grid-cols-1 gap-3", "tablet:grid-cols-4")}
        onSubmit={onSubmit}
      >
        <Input
          name='password'
          type='password'
          placeholder='Password'
          className={cn("tablet:col-span-3")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          className='gap-3'
          type='submit'
          disabled={loading}
        >
          {loading ? (
            <>
              <Icon
                name='LoaderCircle'
                size={16}
                className='animate-spin'
              />
              Loading...
            </>
          ) : (
            <>Submit</>
          )}
        </Button>
      </form>
      <span
        className={cn(
          "muted text-pretty text-center text-red-500",
          errorMessage ? "visible" : "invisible",
        )}
      >
        {errorMessage || "Nothing wrong here, just a password wall"}
      </span>
    </div>
  );
}
