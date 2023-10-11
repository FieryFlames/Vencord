/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { proxyLazy } from "@utils/lazy";

export const zustand = {
    create: {} as typeof import("zustand")["create"],
};

interface BearState {
    bears: number;
    increase: (by: number) => void;
}

export const useBearStore = proxyLazy(() => zustand.create<BearState>(
    set => ({
        bears: 0,
        increase: by => set(state => ({ bears: state.bears + by })),
    })
));
