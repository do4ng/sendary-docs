"use client";

import { useEffect } from "react";

import { scrollTop } from "./scrolltop";

export default function ScrollToTop() {
  useEffect(() => {
    const { hash } = window.location;

    if (!hash) {
      scrollTop();
      return;
    }

    document
      .querySelector(".content")
      ?.querySelector<HTMLElement>(`[id="${hash.slice(1)}"]`)
      ?.scrollIntoView();
  }, []);

  return null;
}
