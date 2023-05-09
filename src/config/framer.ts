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
