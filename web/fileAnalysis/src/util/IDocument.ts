
interface Document {
    onmousewheel: ((this: Document, ev: WheelEvent) => any) | null;
}

declare function parseInt(val:number): number;

type Vector<K extends keyof any, T> = {
    [P in K]: T;
}

type Dictionary<K extends keyof any, T> = {
    [P in K]: T;
}