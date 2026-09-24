import * as QueueCore from './queue-core.js';

const CHECKS_UNTIL_STUCK = 3;

export default class Queue {
    #name;
    #trace;
    #tails = new Map;

    constructor(name, {trace = true} = {}) {
        QueueCore.registerQueue(name);

        this.#name = name;
        this.#trace = trace;
    }

    run(name, fn, key = null) {
        const entry = QueueCore.enter({
            label: `${this.constructor.name}.${this.#name}${key ? `[${key}]` : ''}.${name}`,
            checksUntilStuck: CHECKS_UNTIL_STUCK,
            queue: this,
            key,
            trace: this.#trace ? new Error : null,
        }, QueueCore.STATE_WAITING);

        const start = () => {
            QueueCore.setState(entry, QueueCore.STATE_RUNNING);
            return fn();
        };

        const finish = () => {
            if (this.#tails.get(key) === tail) {
                this.#tails.delete(key);
            }

            QueueCore.leave(entry);
        };

        const turn = (this.#tails.get(key) ?? Promise.resolve()).then(start, start);
        const tail = turn.then(finish, finish);

        this.#tails.set(key, tail);

        return turn;
    }
}
