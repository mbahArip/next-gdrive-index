import { useRouter as useNextRouter } from "next/navigation";
import NProgress from "nprogress";

/**
 * Custom useRouter hook that add NProgress to the router
 * Why? Because NProgress is not working with Next.js 14 router
 * So we need to add it manually
 */
export default function useRouter() {
  const router = useNextRouter();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push } = router;

  router.push = (...args: Parameters<typeof push>) => {
    NProgress.start();
    return push(...args);
  };

  return router;
}
