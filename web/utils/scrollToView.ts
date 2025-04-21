export default function scrollToView(uuid?: string) {
  if (!uuid) {
    return;
  }
  const element = document.getElementById(uuid);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  } else {
    window.location.hash = uuid;
    const element = document.getElementById("the-end");
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
}
