import {
    ActionIcon,
    Button,
    Card,
    Container,
    Group,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { IconPlus, IconSettings, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import wordsData from "../../data/words.json";
import { useGameStore } from "../../store/useGameStore";

export const PlayerSetup = () => {
    const { players, addPlayer, removePlayer, settings, updateSettings, startGame, goHome } = useGameStore();
    const [nameInput, setNameInput] = useState("");

    const handleAddParams = () => {
        if (players.length >= 20) return;
        addPlayer(nameInput.trim());
        setNameInput("");
    };

    const isValidStart = players.length >= 3;

    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <Group justify="center" align="center" gap="xs" onClick={goHome} style={{ cursor: "pointer" }}>
                    <Title order={1} c="orange.7">
                        Undercover Party
                    </Title>
                </Group>

                {/* Settings Card */}
                <Card withBorder shadow="sm" radius="md">
                    <Group justify="space-between" mb="xs">
                        <Group gap={5}>
                            <IconSettings size={20} />
                            <Text fw={600}>ตั้งค่าเกม (Settings)</Text>
                        </Group>
                    </Group>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text>จำนวน Undercover</Text>
                            <NumberInput
                                value={settings.undercoverCount}
                                onChange={(v) => updateSettings({ undercoverCount: Number(v) })}
                                min={1}
                                max={Math.max(1, Math.floor((players.length - 1) / 2))}
                                w={80}
                            />
                        </Group>
                        <Group justify="space-between">
                            <Text>มี Mr. White หรือไม่?</Text>
                            <Switch
                                checked={settings.includeMrWhite}
                                onChange={(e) => updateSettings({ includeMrWhite: e.currentTarget.checked })}
                                color="orange"
                            />
                        </Group>
                        <Select
                            label="หมวดหมู่คำศัพท์"
                            placeholder="เลือกหมวดหมู่"
                            data={[
                                { value: "ALL", label: "ทั้งหมด (All Categories)" },
                                ...wordsData.categories.map((c) => ({ value: c.name, label: c.name })),
                            ]}
                            value={settings.selectedCategoryId}
                            onChange={(val) => updateSettings({ selectedCategoryId: val || "ALL" })}
                            allowDeselect={false}
                        />
                    </Stack>
                </Card>

                {/* Players List */}
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                    {players.map((p) => (
                        <Card key={p.id} padding="sm" radius="md" withBorder>
                            <Group justify="center" mb="xs">
                                <Text size="3rem" style={{ lineHeight: 1 }}>
                                    {p.avatar}
                                </Text>
                            </Group>
                            <Text fw={500} ta="center" truncate>
                                {p.name}
                            </Text>
                            <Group justify="center" mt="xs">
                                <ActionIcon color="red" variant="subtle" onClick={() => removePlayer(p.id)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    ))}

                    {/* Add Button Card */}
                    <Card
                        padding="sm"
                        radius="md"
                        withBorder
                        style={{
                            borderStyle: "dashed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Stack align="center" gap="xs" w="100%">
                            <TextInput
                                placeholder="ชื่อผู้เล่น..."
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddParams()}
                                variant="filled"
                                radius="md"
                                w="100%"
                            />
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={handleAddParams}
                                fullWidth
                                variant="light"
                                color="orange"
                            >
                                เพิ่ม
                            </Button>
                        </Stack>
                    </Card>
                </SimpleGrid>

                <Button
                    fullWidth
                    size="xl"
                    radius="xl"
                    color="orange"
                    onClick={startGame}
                    disabled={!isValidStart}
                    mt="md"
                >
                    เริ่มเกม! ({players.length} คน)
                </Button>
            </Stack>
        </Container>
    );
};
