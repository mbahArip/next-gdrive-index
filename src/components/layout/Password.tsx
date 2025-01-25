"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PageLoader } from "~/components/layout";
import { LoadingButton } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import useLoading from "~/hooks/useLoading";
import useRouter from "~/hooks/usePRouter";
import { cn, toUrlPath } from "~/lib/utils";

import { CheckIndexPassword, CheckPagePassword, SetIndexPassword, SetPagePassword } from "~/actions/password";

type Props =
  | {
      type: "global";
      errorMessage?: string;
    }
  | {
      type: "path";
      paths: { path: string; id: string }[];
      errorMessage?: string;
    };
export default function Password(props: Props) {
  const router = useRouter();
  const loading = useLoading();

  const [input, setInput] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return toast.error("Password is required", { id: "password" });
    setSubmitLoading(true);
    toast.loading("Validating password...", { id: "password" });

    try {
      if (props.type === "global") {
        await SetIndexPassword(input);
        const res = await CheckIndexPassword();
        if (!res.success) return toast.error(res.error, { id: "password" });
      } else {
        await SetPagePassword(toUrlPath(props.paths), input);
        const res = await CheckPagePassword(props.paths);
        if (!res.success) return toast.error(res.error, { id: "password" });
      }

      toast.success("Password accepted! Refreshing...", { id: "password" });
      router.refresh();
    } finally {
      setSubmitLoading(false);
      setInput("");
    }
  };

  if (loading) return <PageLoader message='Checking password...' />;

  return (
    <div className={cn("mx-auto h-full w-full max-w-md", "flex flex-grow flex-col items-center justify-center gap-4")}>
      <img
        src='/images/undraw_vault.svg'
        alt='Password illustration'
        loading='eager'
        className={cn("h-48 w-64 object-contain")}
      />
      <div className='flex flex-col items-center justify-center'>
        <h3 className='text-balance text-center'>
          {props.type === "global"
            ? "The site is password protected"
            : "The folder or file you are trying to access is password protected"}
        </h3>
      </div>

      <form
        className={cn("w-full", "grid grid-cols-1 gap-2", "tablet:grid-cols-4")}
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
        <LoadingButton
          loading={submitLoading}
          type='submit'
          disabled={!input}
        >
          Submit
        </LoadingButton>
      </form>
      <span className={cn("text-pretty text-center text-destructive", props.errorMessage ? "visible" : "invisible")}>
        {props.errorMessage ?? "Nothing here, just a password wall"}
      </span>
    </div>
  );
}
