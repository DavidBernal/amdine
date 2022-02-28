declare const _default: {
    define: (name: string, value: any) => Promise<void>;
    defineWithDependencies: (name: string, deps: string[], factory: Function) => void;
    init: (options?: {
        glob?: string;
    }) => Promise<void>;
};
export default _default;
