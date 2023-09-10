import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "components/Button";
import ButtonIcon from "components/ButtonIcon";

interface PasswordLayoutProps {
  onSubmitted: (password: string) => void;
  path: string;
}
export default function PasswordLayout(
  props: PasswordLayoutProps,
) {
  const router = useRouter();
  const [showPassword, setShowPassword] =
    useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  return (
    <div className='col-span-full text-center min-h-[50vh] flex-grow flex flex-col items-center justify-center'>
      <figure>
        <img
          src='/images/password.png'
          alt="You don't have access"
          className='w-64 h-64 tablet:w-96 tablet:h-96'
        />
      </figure>

      <div className='w-full flex items-center justify-center flex-col my-8'>
        <span className='text-lg font-medium'>
          The folder / file you are trying to access is
          protected with a password.
        </span>
        <pre className='max-w-sm w-full tablet:max-w-2xl'>
          <code className='text-sm'>{props.path}</code>
        </pre>
        <span>Please enter the password to continue:</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmitted(password);
          setPending(true);
        }}
        className='w-full max-w-lg flex items-center border border-primary-500 rounded-lg'
      >
        <div className='w-full flex items-center px-2 bg-primary-900 rounded-l-lg overflow-hidden'>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete='off'
            className='w-full px-2 py-2 bg-primary-900 outline-none'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ButtonIcon
            type='button'
            variant='transparent'
            icon={showPassword ? "ion:eye-off" : "ion:eye"}
            size='small'
            className='p-1'
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <Button
          variant='accent'
          type='submit'
          className='rounded-r-lg w-24'
          disabled={pending}
        >
          {pending ? (
            <Icon
              icon='mdi:loading'
              className='animate-spin'
              width={24}
              height={24}
              color='currentColor'
            />
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
}
