declare module "@mapbox/polyline" {
  interface Polyline {
    decode: (str: string) => Array<[number, number]>;
    encode: (coordinates: Array<[number, number]>) => string;
  }

  const polyline: Polyline;
  export default polyline;
}
