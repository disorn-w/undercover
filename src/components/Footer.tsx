import { Anchor, Center, Text } from "@mantine/core";

export const Footer = () => {
    return (
        <Center p="md" pos="static" style={{ zIndex: 0 }}>
            <Text size="xs" c="dimmed">
                Developed with ❤️ by{" "}
                <Anchor href="https://github.com/yourusername" target="_blank" c="orange">
                    Game Diswac
                </Anchor>
            </Text>
        </Center>
    );
};
