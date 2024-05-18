"use client";

import { DependencyList, useEffect, useState } from "react";

type Props = {
  awaitFor?: () => Promise<void>;
  deps?: DependencyList;
};
export default function useLoading(awaitFor?: () => Promise<void>, deps: DependencyList = []) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (awaitFor) {
      awaitFor().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
