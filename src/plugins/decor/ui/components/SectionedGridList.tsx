/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy } from "@webpack";

import cl from "../../lib/utils/cl";

const ScrollerClasses = findByPropsLazy("managedReactiveScroller");

interface GridProps {
    renderItem: (item: any) => JSX.Element;
    items: any[];
}

function Grid(props: GridProps) {
    return <div className={cl("sectioned-grid-list-grid")}>
        {props.items.map(props.renderItem)}
    </div>;
}

interface SectionedGridListProps {
    renderItem: (item: any) => JSX.Element;
    renderSectionHeader: (section: any) => JSX.Element;
    sections: any[];
}

export default function SectionedGridList(props: SectionedGridListProps) {
    return <div className={`${cl("sectioned-grid-list-container")} ${ScrollerClasses.thin}`}>
        {props.sections.map(section => <div className={cl("sectioned-grid-list-section")}>
            {props.renderSectionHeader(section)}
            <Grid
                renderItem={props.renderItem}
                items={section.items}
            />
        </div>)}
    </div>;
}
