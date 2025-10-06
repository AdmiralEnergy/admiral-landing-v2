export {};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    rdt?: any;
  }
}
