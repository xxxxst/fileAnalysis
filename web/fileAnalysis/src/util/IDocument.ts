

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

// declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
// declare function clearTimeout(timeoutId: number): void;

declare namespace NodeJS {
	// @ts-ignore
	type Timeout = any;
}

interface WheelEvent {
	wheelDelta:number;
} 