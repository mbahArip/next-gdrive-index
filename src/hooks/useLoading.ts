"use client";

import { type DependencyList, useEffect, useState } from "react";

export default function useLoading(awaitFor?: () => Promise<void>, deps: DependencyList = []) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (awaitFor) {
      void awaitFor().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
