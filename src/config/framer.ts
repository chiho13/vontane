export const up_animation_props = {
  animate: {
    opacity: 1,
    y: 0,
  },
  initial: {
    opacity: 0,
    y: "5px",
  },
  transition: {
    duration: 0.2,
  },
  enter: {
    opacity: 1,
    display: "block",
    transition: {
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: "5px",
    transition: {
      duration: 0.2,
    },
  },
};

export const slightbouncey = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  animate: {
    scale: [0.95, 1.01, 1],
    opacity: [0, 1, 1],
  },
  transition: {
    ease: [0.54, 0.88, 0.43, 1],
    duration: 0.3,
  },
  exit: {
    scale: 0.95,
    opacity: 0,
  },
};
