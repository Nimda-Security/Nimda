/// <reference types="vite/client" />

declare module '*.jsx' {
  const component: any;
  export default component;
}

declare module '*.js' {
  const module: any;
  export = module;
}
