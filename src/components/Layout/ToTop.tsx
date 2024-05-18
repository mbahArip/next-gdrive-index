"use client";

import { useEffect, useState } from "react";

import { Icon } from "~/components/Global";
import { Button } from "~/components/ui/button";

import { cn } from "~/utils/cn";

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
        "fixed bottom-6 right-6 z-10 transition",
        show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Button
        size={"icon"}
        variant={"outline"}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <Icon
          name='ChevronUp'
          size='1rem'
        />
      </Button>
    </div>
  );
}
