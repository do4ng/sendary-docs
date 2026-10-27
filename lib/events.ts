export const SENDARY_EVENTS = {
  closeSidebar: "sendary:close-sidebar",
  openToc: "sendary:open-toc",
  openSearch: "sendary:open-search",
} as const;

export type SendaryEvent = (typeof SENDARY_EVENTS)[keyof typeof SENDARY_EVENTS];

export function dispatchSendaryEvent(name: SendaryEvent): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(name));
}
