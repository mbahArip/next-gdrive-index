"use client";

import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import Icon from "~/components/ui/icon";

import { cn } from "~/lib/utils";

export default function ToTop() {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => {
      setShow(window.scrollY > 100);
    };

    window.addEventListener("scroll", handler);

    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  return (
    <div
      slot='to-top-fab'
      className={cn(
        "fixed bottom-4 right-6 z-50 transition",
        show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Button
        size={"icon"}
        variant={"outline"}
        className='h-10 w-10 rounded-full p-0 shadow'
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <Icon
          name='ChevronUp'
          className='size-6'
        />
      </Button>
    </div>
  );
}
