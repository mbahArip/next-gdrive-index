"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Icon, Loader } from "~/components/Global";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { cn } from "~/utils/cn";

import useLoading from "~/hooks/useLoading";

import { CheckPassword, CheckSitePassword, SetPassword, SetSitePassword } from "actions";

type Props = {
  path: string;
  checkPaths?: { path: string; id: string }[];
  errorMessage?: string;
};
export default function Password({ path, checkPaths, errorMessage }: Props) {
  const router = useRouter();
  const loading = useLoading();

  const [input, setInput] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);
    toast.loading("Checking password...", {
      id: "password",
    });

    try {
      if (!input) throw new Error("Password is required");
      if (path === "global") {
        const set = await SetSitePassword(input);
        if (!set.success) throw new Error(set.message);

        const check = await CheckSitePassword();
        if (!check.success) throw new Error(check.message);
      } else {
        if (!checkPaths) throw new Error("No path found, try to refresh the page.");
        const set = await SetPassword(path, input);
        if (!set.success) throw new Error(set.message);

        const check = await CheckPassword(checkPaths);
        if (!check.success) throw new Error(check.message);
      }

      toast.success("Password accepted! Refreshing...", {
        id: "password",
      });
      console.log("Password accepted! Refreshing...");
      router.refresh();
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: "password",
      });
      setSubmitLoading(false);
    } finally {
      setInput("");
    }
  };

  if (loading) return <Loader message='Checking password...' />;

  return (
    <div className={cn("mx-auto h-full w-full max-w-md", "flex flex-grow flex-col items-center justify-center gap-3")}>
      <img
        src='/images/undraw_vault.svg'
        alt='Password illustration'
        loading='eager'
        className={cn("h-48 w-64 object-contain")}
      />
      <div className='flex flex-col items-center justify-center'>
        <h3 className='text-balance text-center'>
          {path === "global"
            ? "This site are password protected"
            : "The folder or file you are trying to access is password protected"}
        </h3>
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
          disabled={submitLoading}
        >
          {submitLoading ? (
            <>
              <Icon
                name='LoaderCircle'
                size={"1rem"}
                className='animate-spin'
              />
              Loading...
            </>
          ) : (
            <>Submit</>
          )}
        </Button>
      </form>
      <span className={cn("text-pretty text-center text-destructive", errorMessage ? "visible" : "invisible")}>
        {errorMessage || "Nothing wrong here, just a password wall"}
      </span>
    </div>
  );
}
