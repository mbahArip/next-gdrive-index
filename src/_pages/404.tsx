import Button from "components/Button";
import LoaderLayout from "components/Layout/Loader";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <LoaderLayout
      seo={{
        title: "Not Found",
      }}
    >
      <div className='relative flex h-full w-full flex-col items-center justify-center gap-4'>
        <figure>
          <img
            src='/images/404.png'
            alt='Page not found'
            className='h-64 w-64 object-contain tablet:h-96 tablet:w-96'
          />
        </figure>

        <div className='my-8 flex w-full flex-col items-center justify-center'>
          <span className='text-lg font-medium'>
            The page you are trying to access is not found.
          </span>
          <span>Please check the URL or go back to the homepage.</span>

          <div className='my-4 flex flex-col items-center justify-between gap-2 tablet:my-12 tablet:flex-row tablet:gap-4'>
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
