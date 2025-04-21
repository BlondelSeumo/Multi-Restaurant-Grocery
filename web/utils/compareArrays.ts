function compareArrays(a: number[], b: number[], emptyValue = false) {
  if (a.length !== b.length) {
    return emptyValue;
  }
  let set: Record<number, number> = {};
  a.forEach((i) => {
    if (set[i] !== undefined) {
      set[i]++;
    } else {
      set[i] = 1;
    }
  });
  let difference = b.every((i) => {
    if (set[i] === undefined) {
      return false;
    } else {
      set[i]--;
      if (set[i] === 0) {
        delete set[i];
      }
      return true;
    }
  });
  return Object.keys(set).length == 0 && difference;
}

export default compareArrays;
