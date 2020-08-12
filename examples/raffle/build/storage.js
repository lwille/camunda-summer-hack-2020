"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Storage {
    constructor() {
        this.sets = {};
    }
    add(key, value) {
        this.sets[key].add(value);
        return this;
    }
    take(key) {
        const set = this.sets[key];
        const values = Array.from(this.sets[key].entries());
        const idx = Math.floor(Math.random() * values.length);
        return values[idx][1];
    }
    new(key) {
        this.sets[key] = new Set();
    }
    drop(key) {
        delete this.sets[key];
    }
}
exports.default = Storage;
