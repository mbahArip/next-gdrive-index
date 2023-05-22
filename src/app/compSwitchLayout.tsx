"use client";

import {
  LayoutContext,
  TLayoutContext,
} from "context/layoutContext";
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MdArrowDropDown,
  MdGridView,
  MdList,
} from "react-icons/md";

function SwitchLayout() {
  const { layout, setLayout } =
    useContext<TLayoutContext>(LayoutContext);
  const [isRenderGrid, setIsRenderGrid] =
    useState<boolean>();
  const [isDropdownOpen, setIsDropdownOpen] =
    useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsRenderGrid(layout === "grid");
  }, [layout]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [dropdownRef]);

  return (
    <div
      className={
        "relative flex w-fit flex-shrink-0 flex-grow-0 flex-col"
      }
      ref={dropdownRef}
    >
      <div
        className={"layoutDropdown capitalize"}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className={"flex w-16 items-center gap-2"}>
          {isRenderGrid && (
            <MdGridView className={"h-4 w-4"} />
          )}
          {!isRenderGrid && (
            <MdList className={"h-4 w-4"} />
          )}
          <span>{isRenderGrid ? "Grid" : "List"}</span>
        </div>
        <MdArrowDropDown />
      </div>
      <div
        className={`layoutOption absolute left-0 right-0 top-0 z-10 flex ${
          isDropdownOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        } ${
          isRenderGrid ? "flex-col" : "flex-col-reverse"
        }`}
      >
        <div
          data-active={isRenderGrid}
          className={"layoutItem"}
          onClick={() => {
            setLayout("grid");
            setIsRenderGrid(true);
            setIsDropdownOpen(false);
          }}
        >
          <MdGridView className={"h-4 w-4"} />
          <span>Grid</span>
        </div>
        <div
          data-active={!isRenderGrid}
          className={"layoutItem"}
          onClick={() => {
            setLayout("list");
            setIsRenderGrid(false);
            setIsDropdownOpen(false);
          }}
        >
          <MdList className={"h-4 w-4"} />
          <span>List</span>
        </div>
      </div>
    </div>
  );
}

export default SwitchLayout;
