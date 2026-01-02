import { Accordion, Button, Card, Container, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconGhost, IconQuestionMark, IconSpy, IconUsers } from "@tabler/icons-react";
import { useGameStore } from "../../store/useGameStore";

export const HomeScreen = () => {
    const { enterSetup } = useGameStore();

    return (
        <Container size="sm" py="xl">
            <Stack align="center" gap="xl" mt="xl">
                <Stack align="center" gap="xs">
                    <ThemeIcon size={80} radius="xl" color="orange" variant="light">
                        <IconSpy size={50} />
                    </ThemeIcon>
                    <Title order={1} size="3rem" ta="center" c="orange.8">
                        Undercover
                    </Title>
                    <Text size="lg" c="dimmed" ta="center">
                        เกมจับโกหกหาเพื่อนร่วมทีมและคนร้าย!
                    </Text>
                </Stack>

                <Card withBorder radius="md" p="lg" w="100%">
                    <Title order={3} mb="md" ta="center">
                        กติกาการเล่น (Game Rules)
                    </Title>
                    <Accordion variant="separated" radius="md">
                        <Accordion.Item value="civilian">
                            <Accordion.Control icon={<IconUsers size={20} color="teal" />}>
                                <Text fw={600}>Civilian (พลเมืองดี)</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text size="sm">
                                    คุณจะได้รับคำศัพท์เหมือนคนส่วนใหญ่ เป้าหมายคือหาคนที่ "ไม่ใช่พวกเรา" (Undercover
                                    หรือ Mr. White) และโหวตออกให้หมด!
                                </Text>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="undercover">
                            <Accordion.Control icon={<IconSpy size={20} color="red" />}>
                                <Text fw={600}>Undercover (สายลับ)</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text size="sm">
                                    คุณจะได้คำศัพท์ที่ต่างจากคนอื่นนิดหน่อย (แต่ใกล้เคียงกัน)
                                    คุณต้องเนียนว่ามีคำเดียวกับ Civilians และเอาตัวรอดจนจบเกม หรือโหวต Civilians
                                    ออกให้หมด
                                </Text>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="mrwhite">
                            <Accordion.Control icon={<IconGhost size={20} color="gray" />}>
                                <Text fw={600}>Mr. White (คนความจำเสื่อม)</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text size="sm">
                                    คุณจะไม่ได้รับคำศัพท์ใดๆ เลย (เห็นเป็น `^^`)
                                    คุณต้องฟังคนอื่นคุยแล้วเดาให้ได้ว่าคำศัพท์คืออะไร ถ้าคุณถูกจับได้
                                    คุณจะมีโอกาสเดาคำศัพท์ 1 ครั้งเพื่อขโมยชัยชนะ!
                                </Text>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="flow">
                            <Accordion.Control icon={<IconQuestionMark size={20} color="blue" />}>
                                <Text fw={600}>วิธีการเล่น</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap="xs" fs="italic">
                                    <Text size="sm">1. ส่งมือถือให้กันทีละคนเพื่อดูคำศัพท์ลับ</Text>
                                    <Text size="sm">2. จับเวลาคุยกันและสังเกตพิรุธ</Text>
                                    <Text size="sm">3. โหวตคนน่าสงสัยออก</Text>
                                    <Text size="sm">4. ถ้าฝ่ายดีกำจัดคนร้ายหมด = ชนะ!</Text>
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Card>

                <Button size="xl" radius="xl" color="orange" fullWidth onClick={enterSetup}>
                    เข้าสู่เกม
                </Button>
            </Stack>
        </Container>
    );
};
