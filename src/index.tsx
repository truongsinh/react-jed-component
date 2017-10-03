export * from "./pure-component";
import * as jed from "jed";
export const sprintf: (format: string, ...value: Array<string | number>) => string = jed.sprintf;
