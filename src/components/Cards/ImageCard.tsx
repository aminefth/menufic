import type { FC, HTMLAttributeAnchorTarget } from "react";

import type { EditDeleteOptionsProps } from "../EditDeleteOptions";
import { Box, Card, clsx, Flex, Text } from "@mantine/core";
import type { Image } from "@prisma/client";
import Link from "next/link";

import { White } from "src/styles/theme";

import { useStyles } from "./styles";
import { EditDeleteOptions } from "../EditDeleteOptions";
import { ImageKitImage } from "../ImageKitImage";

interface Props {
    /** To show the three dot menu for the card */
    editDeleteOptions?: EditDeleteOptionsProps;
    /** Path that needs to be opened, when clicked */
    href?: string;
    /** Image to be displayed in the card */
    image?: Image | null;
    /** Alt text of the image */
    imageAlt?: string;
    /** Subtitle of the card */
    subTitle?: string;
    /** To decided whether the link needs to be opened in the same tab or different one */
    target?: HTMLAttributeAnchorTarget;
    /** Title of the card */
    title?: string;
}

/** Card item with an image as its background */
export const ImageCard: FC<Props> = ({ image, title, subTitle, editDeleteOptions, target, href }) => {
    const { classes } = useStyles();

    const content = (
        <>
            <Box className={classes.imageWrap}>
                <ImageKitImage
                    blurhash={image?.blurHash}
                    color={image?.color}
                    height={150}
                    imageAlt={title}
                    imagePath={image?.path}
                    width={450}
                />
            </Box>

            <Box className={classes.overlay} />

            <Box className={classes.content}>
                <Flex align="flex-end">
                    <Box sx={{ flex: 1 }}>
                        <Text className={classes.imageTitle} size="lg" weight={500}>
                            {title}
                        </Text>

                        <Text className={clsx(classes.subTitle, classes.imageSubTitle)} size="sm">
                            {subTitle}
                        </Text>
                    </Box>
                    {editDeleteOptions && (
                        <EditDeleteOptions {...editDeleteOptions} color={editDeleteOptions.color || White} />
                    )}
                </Flex>
            </Box>
        </>
    );

    if (href && editDeleteOptions?.loading !== true) {
        return (
            <Card className={classes.card} p="lg" withBorder>
                <Link href={href} target={target}>
                    {content}
                </Link>
            </Card>
        );
    }

    return (
        <Card className={clsx(classes.card, classes.cardNoCursor)} p="lg" withBorder>
            {content}
        </Card>
    );
};
