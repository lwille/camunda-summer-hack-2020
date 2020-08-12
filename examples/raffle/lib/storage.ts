import ti from "@thi.ng/iterators";
export default class Storage<Type> {
  sets: { [index: string]: Set<Type> } = {};

  add(key: string, value: Type): this {
    this.sets[key].add(value);
    return this;
  }

  take(key: string): Type {
    const values: [Type, Type][] = Array.from(this.sets[key].entries());
    const idx = Math.floor(Math.random() * values.length);
    return values[idx][1];
  }

  new(key: string) {
    this.sets[key] = new Set<Type>();
  }

  drop(key: string) {
    delete this.sets[key];
  }
}
