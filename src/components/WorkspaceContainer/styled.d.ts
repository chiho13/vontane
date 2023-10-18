import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    brandColor: string;
    accentColor: string;
    // add other theme properties if needed
  }
}
