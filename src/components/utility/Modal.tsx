import { ReactNode } from "react";
import { MdClose } from "react-icons/md";

type Props = {
  title: string | ReactNode;
  isOpen: boolean;
  isCentered: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  title,
  isOpen,
  isCentered = true,
  onClose,
  children,
}: Props) {
  return (
    <div
      className={`fixed left-0 top-0 z-[1001] flex h-full w-full justify-center bg-zinc-200/75 text-inherit transition-all duration-300 dark:bg-zinc-900/75 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      } ${isCentered ? "items-center" : "items-start py-24"}`}
      onClick={() => {
        onClose();
      }}
    >
      <div
        className={`relative flex w-full min-w-[320px] max-w-sm flex-col gap-4 rounded-lg bg-zinc-200 p-4 drop-shadow-lg dark:bg-zinc-700 tablet:max-w-screen-tablet ${
          isOpen ? "top-0" : "-top-12"
        } transition-all duration-300`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className='flex items-center justify-between'>
          <span>{title}</span>
          <span
            className='interactive cursor-pointer'
            onClick={onClose}
          >
            <MdClose />
          </span>
        </div>
        <div className='flex flex-col items-center gap-2'>{children}</div>
      </div>
    </div>
  );
}
