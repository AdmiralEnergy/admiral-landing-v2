export {};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    rdt?: any;
  }
  interface ImportMetaEnv {
    readonly VITE_ENABLE_ADVISOR?: 'true' | 'false' | string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
