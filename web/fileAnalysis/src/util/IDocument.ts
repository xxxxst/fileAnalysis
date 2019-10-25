
interface Document {
    onmousewheel: ((this: Document, ev: WheelEvent) => any) | null;
}

declare function parseInt(val:number): number;