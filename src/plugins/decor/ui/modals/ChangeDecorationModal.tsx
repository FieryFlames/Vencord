/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { LazyComponent } from "@utils/react";
import { findByCode, findByPropsLazy, waitFor } from "@webpack";
import { Button, Forms, Parser, Text, useEffect, UserStore, useState } from "@webpack/common";

import { Decoration, getPresets, Preset } from "../../lib/api";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import cl from "../../lib/utils/cl";
import discordifyDecoration from "../../lib/utils/discordifyDecoration";
import requireAvatarDecorationModal from "../../lib/utils/requireAvatarDecorationModal";
import { AvatarDecorationModalPreview } from "../components";
import DecorDecorationGridDecoration from "../components/DecorDecorationGridDecoration";
import SectionedGridList from "../components/SectionedGridList";

let MasonryList;
waitFor("MasonryList", m => {
    ({ MasonryList } = m);
});

const UserSummaryItem = LazyComponent(() => findByCode("defaultRenderUser", "showDefaultAvatarsForNullUsers"));
const DecorationModalStyles = findByPropsLazy("modalFooterShopButton");
const DecorationComponentStyles = findByPropsLazy("decorationGridItemChurned");

interface Section {
    title: string;
    subtitle?: string;
    itemKeyPrefix: string;
    items: ("none" | "create" | Decoration)[];
    authorIds?: string[];
}
export default function ChangeDecorationModal(props: any) {
    // undefined = not trying, null = none, Decoration = selected
    const [tryingDecoration, setTryingDecoration] = useState<Decoration | null | undefined>(undefined);
    const isTryingDecoration = typeof tryingDecoration !== "undefined";

    const {
        decorations,
        selectedDecoration,
        fetch: fetchUserDecorations,
        select: selectDecoration
    } = useCurrentUserDecorationsStore();

    useEffect(() => {
        fetchUserDecorations();
    }, []);

    const activeSelectedDecoration = isTryingDecoration ? tryingDecoration : selectedDecoration;
    const activeDecorationHasAuthor = typeof activeSelectedDecoration?.authorId !== "undefined";
    const hasPendingReview = decorations.some(d => d.reviewed === false);

    const [presets, setPresets] = useState<Preset[]>([]);
    useEffect(() => { getPresets().then(setPresets); }, []);
    const presetDecorations = presets.flatMap(preset => preset.decorations);

    const activeDecorationPreset = presets.find(preset => preset.id === activeSelectedDecoration?.presetId);
    const isActiveDecorationPreset = typeof activeDecorationPreset !== "undefined";

    const ownDecorations = decorations.filter(d => !presetDecorations.some(p => p.hash === d.hash));

    const masonryListData = [
        {
            title: "Your Decor Decorations",
            itemKeyPrefix: "ownDecorations",
            items: ["none", ...ownDecorations, "create"]
        },
        ...presets.map(preset => ({
            title: preset.name,
            subtitle: preset.description || undefined,
            itemKeyPrefix: `preset-${preset.id}`,
            items: preset.decorations,
            authorIds: preset.authorIds
        }))
    ] as Section[];

    return <ModalRoot
        {...props}
        size={ModalSize.DYNAMIC}
        className={DecorationModalStyles.modal}
    >
        <ModalHeader separator={false} className={cl("modal-header")}>
            <Text
                color="header-primary"
                variant="heading-lg/semibold"
                tag="h1"
                style={{ flexGrow: 1 }}
            >
                Change Decor Decoration
            </Text>
            <ModalCloseButton onClick={props.onClose} />
        </ModalHeader>
        <ModalContent
            className={cl("change-decoration-modal-content")}
            scrollbarType="none"
        >
            <SectionedGridList
                renderItem={(item: any) => {
                    if (typeof item === "string") {
                        return <></>;
                    } else {
                        return <DecorDecorationGridDecoration
                            className={cl("change-decoration-modal-decoration")}
                            decoration={item}
                        />;
                    }
                }}
                renderSectionHeader={(section: Section) => {
                    return <div>
                        <Forms.FormTitle>{section.title}</Forms.FormTitle>
                    </div>;
                }}
                sections={masonryListData}
            />
            <div className={cl("change-decoration-modal-preview")}>
                <AvatarDecorationModalPreview
                    avatarDecorationOverride={isTryingDecoration ? tryingDecoration ? discordifyDecoration(tryingDecoration) : null : undefined}
                    user={UserStore.getCurrentUser()}
                />
                {isActiveDecorationPreset && <Forms.FormTitle className="">Part of the {activeDecorationPreset.name} Preset</Forms.FormTitle>}
                {typeof activeSelectedDecoration === "object" &&
                    <Text
                        variant="text-sm/semibold"
                        color="header-primary"
                    >
                        {activeSelectedDecoration?.alt}
                    </Text>
                }
                {activeDecorationHasAuthor && <Text key={`createdBy-${activeSelectedDecoration.authorId}`}>Created by {Parser.parse(`<@${activeSelectedDecoration.authorId}>`)}</Text>}
            </div>
        </ModalContent>
        <ModalFooter className={cl("modal-footer")}>
            <Button
                onClick={() => {
                    selectDecoration(tryingDecoration!).then(props.onClose);
                }}
                disabled={!isTryingDecoration}
            >
                Apply
            </Button>
            <Button
                onClick={props.onClose}
                color={Button.Colors.PRIMARY}
                look={Button.Looks.LINK}
            >
                Cancel
            </Button>
        </ModalFooter>
    </ModalRoot>;
}

export const openChangeDecorationModal = () =>
    requireAvatarDecorationModal().then(() => openModal(props => <ChangeDecorationModal {...props} />));
