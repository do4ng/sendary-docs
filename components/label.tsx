"use client";

import { usePopover } from "@/lib/use-popover";

export function TextLabel({
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
  } = usePopover("bottom");

  return (
    <div>
      <div
        className="popover text text-label"
        onMouseEnter={show}
        onMouseLeave={hide}
        ref={setReferenceElement}
      >
        {children}
      </div>
      <div
        className="text-label-menu"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {text}
      </div>
    </div>
  );
}
