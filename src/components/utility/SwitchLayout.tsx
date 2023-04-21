import useLocalStorage from "@hooks/useLocalStorage";
import { MdArrowDropDown, MdGridView, MdList } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

type Props = {
  setLayoutStyle: (layoutStyle: "grid" | "list") => void;
};
export default function SwitchLayout({ setLayoutStyle }: Props) {
  const [renderStyle, setRenderStyle] = useLocalStorage<"grid" | "list">(
    "renderStyle",
    "grid",
  );
  const [isRenderGrid, setIsRenderGrid] = useState<boolean>();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsRenderGrid(renderStyle === "grid");
  }, [renderStyle]);

  // Check if click outside dropdownRef
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div
      className={"relative flex w-fit flex-col"}
      ref={dropdownRef}
    >
      <div
        className={"layoutDropdown capitalize"}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className={"flex items-center gap-2"}>
          {isRenderGrid && <MdGridView className={"h-4 w-4"} />}
          {!isRenderGrid && <MdList className={"h-4 w-4"} />}
          <span>{isRenderGrid ? "Grid" : "List"}</span>
        </div>
        <MdArrowDropDown />
      </div>
      <div
        className={`layoutOption absolute left-0 right-0 top-0 z-10 flex flex-col ${
          isDropdownOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          data-active={isRenderGrid}
          className={"layoutItem"}
          onClick={() => {
            setLayoutStyle("grid");
            setRenderStyle("grid");
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
            setLayoutStyle("list");
            setRenderStyle("list");
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
