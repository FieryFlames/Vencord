/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export class Mutex {
    private locked = false;
    private queue: (() => void)[] = [];

    lock() {
        if (this.locked) {
            return new Promise<void>(resolve => {
                this.queue.push(resolve);
            });
        } else {
            this.locked = true;
            return Promise.resolve();
        }
    }

    unlock() {
        if (this.queue.length) {
            const resolve = this.queue.shift();
            if (resolve) {
                resolve();
            }
        } else {
            this.locked = false;
        }
    }

    async with(cb: () => Promise<void>) {
        return await this.lock().then(() => {
            const ret = cb();
            if (ret instanceof Promise) {
                return ret.then(() => {
                    this.unlock();
                });
            }
            this.unlock();
        });
    }
}
