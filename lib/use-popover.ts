import type { Placement } from "@popperjs/core";
import { useCallback, useState } from "react";
import { usePopper } from "react-popper";

export function usePopover(placement: Placement) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
  });

  const show = useCallback(() => {
    popperElement?.setAttribute("data-show", "true");
  }, [popperElement]);

  const hide = useCallback(() => {
    popperElement?.removeAttribute("data-show");
  }, [popperElement]);

  return {
    setReferenceElement,
    setPopperElement,
    styles,
    attributes,
    show,
    hide,
  };
}
