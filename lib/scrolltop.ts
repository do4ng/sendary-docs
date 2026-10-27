export function scrollTop(): void {
  document.querySelector<HTMLElement>(".content")?.scrollTo({
    top: 0,
    behavior: "instant",
  });
}
