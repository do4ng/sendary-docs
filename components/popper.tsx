"use client";

import { usePopover } from "@/lib/use-popover";

export function Popover({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  const {
    setReferenceElement,
    setPopperElement,
    styles,
    attributes,
    show,
    hide,
  } = usePopover("bottom-start");

  return (
    <div
      className="popper-container"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button className="popover btn text" ref={setReferenceElement}>
        {text} <i className="ri-arrow-down-s-line"></i>
      </button>
      <div
        className="popover-menu"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </div>
  );
}
