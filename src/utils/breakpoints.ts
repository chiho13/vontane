import {
  css,
  DefaultTheme,
  FlattenSimpleInterpolation,
  ThemedStyledProps,
  CSSObject,
} from "styled-components";

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export const breakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

type SimpleInterpolationFunction = (
  first:
    | TemplateStringsArray
    | CSSObject
    | ThemedStyledProps<object, DefaultTheme>,
  ...interpolations: Array<string | number | undefined>
) => FlattenSimpleInterpolation;

type MediaQueries = {
  [key in keyof Breakpoints]: SimpleInterpolationFunction;
};

export const mq: MediaQueries = Object.keys(breakpoints).reduce(
  (accumulator, label) => {
    const key = label as keyof Breakpoints;
    accumulator[key] = (
      first:
        | TemplateStringsArray
        | CSSObject
        | ThemedStyledProps<object, DefaultTheme>,
      ...interpolations: Array<string | number | undefined>
    ) => css`
      @media (min-width: ${breakpoints[key]}px) {
        ${css(first, ...interpolations)};
      }
    `;
    return accumulator;
  },
  {} as MediaQueries
);
