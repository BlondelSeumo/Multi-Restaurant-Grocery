import { useEffect, useRef } from "react";

const useDidUpdate = (f: any, conditions: any) => {
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    // Cleanup effects when f returns a function
    return f && f(); //eslint-disable-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, conditions);
};

export default useDidUpdate;
