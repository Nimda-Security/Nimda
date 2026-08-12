/// <reference types="vite/client" />

declare module '*.jsx' {
  const component: import('react').ComponentType<Record<string, unknown>>;
  export default component;
}

declare module '*.js' {
  const module: unknown;
  export = module;
}
