/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback, useEffect, useState } from "@webpack/common";

import { Mutex } from "../mutex";

interface BearState {
    bears: number;
}

// export const useBearStore = zustand.create<BearState>(
//     set => ({
//         bears: 0,
//         increase: by => set(state => ({ bears: state.bears + by })),
//     }),
// );


let previousState: BearState | undefined;
const bearStoreMutex = new Mutex();

export const useBearStore = () => {
    const [state, setState] = useState(previousState);
    useEffect(() => {
        bearStoreMutex.with(async () => (previousState = state, void 0));
    }, [state]);

    const increase = useCallback((by: number) => {
        setState(state => ({ bears: (state?.bears ?? 0) + by }));
    }, [state]);

    return {
        bears: state?.bears ?? 0,
        increase,
    };
};
