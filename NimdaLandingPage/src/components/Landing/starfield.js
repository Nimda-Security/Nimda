export function createStars(count, seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  return Array.from({ length: count }, (_, id) => ({
    id,
    style: {
      top: `${random() * 100}%`,
      left: `${random() * 100}%`,
      width: `${random() * 2 + 1}px`,
      height: `${random() * 2 + 1}px`,
    },
    delay: random() * 5,
  }));
}
