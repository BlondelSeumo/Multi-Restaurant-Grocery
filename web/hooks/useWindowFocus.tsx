import { useEffect, useState } from "react";

export default function useWindowFocus() {
  const [triggered, setTriggered] = useState(0);

  function onFocus() {
    setTriggered((value) => value + 1);
  }

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    onFocus();

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return triggered;
}
