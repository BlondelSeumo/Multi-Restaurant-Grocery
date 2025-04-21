export default function createImage(name) {
  if (!name) return undefined;

  return {
    name,
    uid: name,
    url: name,
  };
}
