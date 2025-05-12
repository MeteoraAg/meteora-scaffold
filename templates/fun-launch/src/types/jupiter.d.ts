interface Jupiter {
  init: (config: any) => void;
  syncProps: (props: any) => void;
}

declare global {
  interface Window {
    Jupiter: Jupiter;
  }
}

export {};
