import { ReactNode, useEffect, useState } from "react";

import ButtonIcon from "components/ButtonIcon";
import ClickAway from "components/ClickAway";

interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  keepMounted?: boolean;
}

export default function Modal(props: ModalProps) {
  let DELAY = 10;

  const [showModal, setShowModal] = useState<boolean>(props.open);
  const [keepMounted, setKeepMounted] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(false);

  const [shouldUnmount, setShouldUnmount] = useState<boolean>(true);

  useEffect(() => {
    const handleClose = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.onClose();
      }
    };
    window.addEventListener("keydown", handleClose);
    return () => {
      window.removeEventListener("keydown", handleClose);
    };
  }, [props]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showModal && !shouldRender) {
      timeoutId = setTimeout(() => {
        setShouldRender(true);
      }, DELAY);
    } else if (!showModal && shouldRender) {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, DELAY);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [showModal, shouldRender, DELAY]);

  useEffect(() => {
    setShowModal(props.open);
    if (props.open) setShouldUnmount(false);
  }, [props.open]);

  useEffect(() => {
    if (showModal && props.keepMounted) setKeepMounted(true);
  }, [showModal, props.keepMounted]);

  const handleClose = () => {
    setShowModal(false);
    if (!keepMounted) setKeepMounted(false);
    props.onClose();
  };

  // useEffect(() => {
  //   if (!showModal && !keepMounted && shouldRender) {
  //     const timeout = setTimeout(() => {
  //       setShouldUnmount(true);
  //     }, 250);
  //     return () => {
  //       clearTimeout(timeout);
  //     };
  //   } else {
  //     setShouldUnmount(false);
  //   }
  // }, [showModal, keepMounted, shouldRender, DELAY]);
  if (shouldUnmount) return null;

  return (
    <ClickAway
      open={showModal}
      onClickAway={handleClose}
      className={`fixed grid place-items-center top-0 left-0 z-[60] w-full h-full transition-smooth ${
        shouldRender ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onTransitionEnd={() => {
        if (!showModal && !keepMounted) {
          setShouldUnmount(true);
        } else {
          setShouldUnmount(false);
        }
      }}
    >
      <div
        className='w-full px-4 max-w-screen-lg'
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className='bg-primary-900 text-primary-50 rounded-lg py-2 px-4 flex flex-col gap-2 w-full'>
          {/* Header */}
          <div className='flex flex-row items-center justify-between py-2'>
            <span className='text-xl font-medium w-full line-clamp-1'>{props.title}</span>
            <ButtonIcon
              icon={"ion:close"}
              onClick={handleClose}
            />
          </div>

          <div className='w-full h-px bg-primary-500' />

          {/* Body */}
          <div className='py-2'>{props.children}</div>

          {/* Footer */}
          {props.footer && <div className='py-2'>{props.footer}</div>}
        </div>
      </div>
    </ClickAway>
  );
}
