import { useState } from "react";
import useLocalStorage from "@hooks/useLocalStorage";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdLock } from "react-icons/md";
import { hashToken } from "@utils/hashHelper";

type Props = {
  folderId: string;
  inputCallback: (data: { [p: string]: string }) => void;
};
export default function Password({ folderId, inputCallback }: Props) {
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStorage] = useLocalStorage<{
    [key: string]: string;
  }>("passwordStorage", {});

  const handleSubmit = () => {
    inputCallback({
      ...passwordStorage,
      [folderId]: hashToken(password),
    });
    // setPasswordStorage({
    //   ...passwordStorage,
    //   [folderId]: hashToken(password),
    // });
    //
    // callback();
  };

  return (
    <div className={"card"}>
      <div className='flex w-full items-center justify-between rounded-lg px-4'>
        <span className='font-bold'>Protected with password</span>
      </div>

      <div className={"divider-horizontal"} />

      <MdLock className={"mx-auto my-4 h-24 w-24 tablet:h-32 tablet:w-32"} />

      <p className={"mx-auto max-w-screen-md px-4 text-center"}>
        The folder or file you are trying to access is protected with a
        password.
        <br />
        Please enter the password to continue.
      </p>

      <div
        className={
          "mx-auto flex w-full max-w-screen-md flex-col gap-2 px-4 py-4"
        }
      >
        <div className={"flex items-center gap-2 max-tablet:flex-col"}>
          <div className={"relative flex w-full items-center"}>
            <input
              type={showPassword ? "text" : "password"}
              className={"w-full pr-4"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder={"Enter your password here..."}
            />
            <div
              className={"relative right-8 flex cursor-pointer items-center"}
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              <IoMdEye
                className={`absolute h-6 w-6 ${
                  showPassword
                    ? "pointer-events-none scale-y-0 opacity-0"
                    : "pointer-events-auto scale-y-100 opacity-100"
                } transition`}
              />
              <IoMdEyeOff
                className={`absolute h-6 w-6 ${
                  !showPassword
                    ? "pointer-events-none scale-y-0 opacity-0"
                    : "pointer-events-auto scale-y-100 opacity-100"
                } transition`}
              />
            </div>
          </div>
          <button
            className={"primary w-full whitespace-nowrap tablet:w-fit"}
            onClick={handleSubmit}
          >
            {/*{isLoading ? (*/}
            {/*  <ReactLoading*/}
            {/*    type='spin'*/}
            {/*    width={16}*/}
            {/*    height={16}*/}
            {/*    className={"loading"}*/}
            {/*  />*/}
            {/*) : (*/}
            Submit
            {/*)}*/}
          </button>
        </div>
      </div>
    </div>
  );
}
