import { createTheme, type MantineColorsTuple } from "@mantine/core";

const vibrantOrange: MantineColorsTuple = [
    "#fff0e4",
    "#ffe0cf",
    "#ffc09b",
    "#ffa064",
    "#ff8436",
    "#ff731a",
    "#ff6a09",
    "#e35800",
    "#ca4d00",
    "#b03e00",
];

export const theme = createTheme({
    primaryColor: "orange",
    colors: {
        orange: vibrantOrange,
    },
    fontFamily: "Verdana, sans-serif",
    headings: { fontFamily: "Greycliff CF, sans-serif" },
    defaultRadius: "md",
    cursorType: "pointer",
});
