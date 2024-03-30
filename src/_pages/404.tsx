import Link from "next/link";

import Button from "components/Button";
import LoaderLayout from "components/Layout/Loader";

export default function NotFoundPage() {
  return (
    <LoaderLayout
      seo={{
        title: "Not Found",
      }}
    >
      <div className='w-full flex h-full flex-col gap-4 relative items-center justify-center'>
        <figure>
          <img
            src='/images/404.png'
            alt='Page not found'
            className='w-64 h-64 tablet:w-96 tablet:h-96 object-contain'
          />
        </figure>

        <div className='w-full flex items-center justify-center flex-col my-8'>
          <span className='text-lg font-medium'>
            The page you are trying to access is not found.
          </span>
          <span>
            Please check the URL or go back to the homepage.
          </span>

          <div className='flex items-center justify-between flex-col tablet:flex-row gap-2 tablet:gap-4 my-4 tablet:my-12'>
            <Link href='/'>
              <Button
                variant='accent'
                rounded='large'
                className='w-full tablet:w-auto'
              >
                Go back to homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </LoaderLayout>
  );
}
