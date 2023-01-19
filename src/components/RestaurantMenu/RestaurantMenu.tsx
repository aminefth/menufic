import type { FC } from "react";
import { useRef } from "react";
import { Box, Text, SimpleGrid, Tabs, createStyles, Switch, useMantineColorScheme } from "@mantine/core";
import type { Category, Image, Menu, MenuItem, Restaurant } from "@prisma/client";
import { useMemo, useState } from "react";
import { ImageKitImage } from "../ImageKitImage";
import { MenuItemCard } from "./MenuItemCard";
import Autoplay from "embla-carousel-autoplay";
import { Carousel } from "@mantine/carousel";
import { IconSun, IconMoonStars } from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { Empty } from "../Empty";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Black, White } from "src/styles/theme";

const useStyles = createStyles((theme) => ({
    headerImageBox: { borderRadius: theme.radius.lg, overflow: "hidden", position: "relative" },
    carousalOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
        backgroundImage: theme.fn.linearGradient(
            180,
            theme.fn.rgba(Black, 0),
            theme.fn.rgba(Black, 0.01),
            theme.fn.rgba(Black, 0.025),
            theme.fn.rgba(Black, 0.05),
            theme.fn.rgba(Black, 0.1),
            theme.fn.rgba(Black, 0.2),
            theme.fn.rgba(Black, 0.35),
            theme.fn.rgba(Black, 0.5)
        ),
    },
    carousalTitle: {
        padding: theme.spacing.md,
        paddingTop: theme.spacing.xl,
        zIndex: 1,
        position: "absolute",
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    themeSwitch: { position: "absolute", bottom: 10, right: 12, zIndex: 1 },
    switchTrack: { background: `${theme.fn.darken(White, 0.1)} !important`, border: "unset" },
    switchThumb: { background: theme.fn.lighten(Black, 0.2) },
}));

interface Props {
    restaurant: Restaurant & {
        menus: (Menu & { categories: (Category & { items: (MenuItem & { image: Image | null })[] })[] })[];
        image: Image | null;
        banners: Image[];
    };
}

/** Component to display all the menus and banners of the restaurant */
export const RestaurantMenu: FC<Props> = ({ restaurant }) => {
    const { classes, theme } = useStyles();
    const bannerCarousalRef = useRef(Autoplay({ delay: 5000 }));
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const isNotMobile = useMediaQuery("(min-width: 600px)");
    const [menuParent] = useAutoAnimate<HTMLDivElement>();
    const [selectedMenu, setSelectedMenu] = useState<string | null | undefined>(restaurant?.menus?.[0]?.id);

    const menuDetails = useMemo(
        () => restaurant?.menus?.find((item) => item.id === selectedMenu),
        [selectedMenu, restaurant]
    );

    const images: Image[] = useMemo(() => {
        const banners = restaurant?.banners;
        if (restaurant?.image) {
            return [restaurant?.image, ...banners];
        }
        return banners;
    }, [restaurant]);

    const haveMenuItems = menuDetails?.categories?.some((category) => category?.items?.length > 0);

    return (
        <Box mih="calc(100vh - 100px)">
            <Box pos="relative">
                <Carousel
                    mx="auto"
                    withIndicators={images.length > 1}
                    withControls={images.length > 1}
                    height={300}
                    plugins={[bannerCarousalRef.current]}
                    onMouseEnter={bannerCarousalRef.current.stop}
                    onMouseLeave={bannerCarousalRef.current.reset}
                    className={classes.headerImageBox}
                    slideGap="md"
                    loop
                    styles={{ indicator: { background: White } }}
                >
                    {images?.map((banner, index) => (
                        <Carousel.Slide key={banner.id}>
                            <ImageKitImage
                                width={750}
                                height={300}
                                imagePath={banner.path}
                                blurhash={banner.blurHash}
                                color={banner.color}
                                imageAlt={`${restaurant.name}-banner-${index}`}
                            />
                            <Box className={classes.carousalOverlay} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
                <Box className={classes.carousalTitle}>
                    <Text color={White} weight="bold" size={isNotMobile ? 40 : 30}>
                        {restaurant?.name}
                    </Text>
                    <Text color={White} opacity={0.7} size={isNotMobile ? 25 : 20}>
                        {restaurant?.location}
                    </Text>
                </Box>
                <Switch
                    className={classes.themeSwitch}
                    checked={colorScheme === "dark"}
                    onChange={() => toggleColorScheme()}
                    size="md"
                    onLabel={<IconSun color={theme.white} size={15} />}
                    offLabel={<IconMoonStars color={theme.colors.dark[7]} size={15} />}
                    classNames={{ track: classes.switchTrack, thumb: classes.switchThumb }}
                />
            </Box>

            <Tabs value={selectedMenu} onTabChange={setSelectedMenu} my={40}>
                <Tabs.List>
                    {restaurant?.menus?.map((menu) => (
                        <Tabs.Tab value={menu.id} key={menu.id} px="lg">
                            <Text size="lg" weight={selectedMenu === menu.id ? "bold" : "normal"} color={theme.black}>
                                {menu.name}
                            </Text>
                            <Text size="xs" opacity={selectedMenu === menu.id ? 1 : 0.5} color={theme.colors.dark[8]}>
                                {menu.availableTime}
                            </Text>
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>
            <Box ref={menuParent}>
                {menuDetails?.categories
                    ?.filter((category) => category?.items.length)
                    ?.map((category) => (
                        <Box key={category.id}>
                            <Text size="lg" my="lg" weight={600}>
                                {category.name}
                            </Text>
                            <SimpleGrid
                                breakpoints={[
                                    { minWidth: "lg", cols: 3 },
                                    { minWidth: "sm", cols: 2 },
                                    { minWidth: "xs", cols: 1 },
                                ]}
                                mb={30}
                            >
                                {category.items?.map((item) => (
                                    <MenuItemCard item={item} key={item.id} />
                                ))}
                            </SimpleGrid>
                        </Box>
                    ))}
                {restaurant?.menus?.length === 0 && !haveMenuItems && (
                    <Empty
                        text="There aren't any menus available for this restaurant. Try checking out later"
                        height={400}
                    />
                )}
                {!!restaurant?.menus?.length && !haveMenuItems && (
                    <Empty
                        text="There aren't any menu items for the chosen restaurant menu. Try checking out later."
                        height={400}
                    />
                )}
            </Box>
        </Box>
    );
};
