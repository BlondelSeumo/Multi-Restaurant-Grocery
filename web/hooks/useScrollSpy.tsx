import { useEffect, useState } from "react";
import spyScroll from "utils/spyScroll";

export default function useScrollSpy(_targetElements?: string[]) {
  const [currentSection, setCurrentSection] = useState("");

  useEffect(() => {
    const wrapperElm = document.getElementById("products-wrapper");
    const onScroll = () => {
      setCurrentSection(spyScroll(wrapperElm));
    };
    if (wrapperElm) {
      window.addEventListener("scroll", onScroll);
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, [_targetElements]);

  return currentSection;
}
