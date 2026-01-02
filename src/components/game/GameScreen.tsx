import {
    Badge,
    Button,
    Card,
    Center,
    Container,
    Group,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconGhost, IconRefresh, IconRefreshOff, IconTrophy } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";

export const GameScreen = () => {
    const { phase, mrWhiteGuessing } = useGameStore();

    if (mrWhiteGuessing) {
        return <MrWhiteGuessScreen />;
    }

    /* Render Phase */
    switch (phase) {
        case "REVEAL":
            return <RevealPhase />;
        case "DISCUSS":
            return <DiscussPhase />;
        case "VOTE":
            return <VotePhase />;
        case "ROUND_SUMMARY":
            return <RoundSummary />;
        case "RESULT":
            return <ResultPhase />;
        default:
            return (
                <Center h="100vh">
                    <Text>Unknown Phase</Text>
                </Center>
            );
    }
};

/* --- Sub Components --- */

const RevealPhase = () => {
    const { players, currentPlayerIndex, nextReveal } = useGameStore();
    const [showWord, setShowWord] = useState(false);
    const currentPlayer = players[currentPlayerIndex];

    // Reset showWord when player changes (though key prop might be better)
    useEffect(() => {
        setShowWord(false);
    }, [currentPlayerIndex]);

    const handleNext = () => {
        setShowWord(false);
        setProgress(0);
        nextReveal();
    };

    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const startPress = () => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setShowWord(true);
                    return 100;
                }
                return prev + 4; // Approx 1.2s to fill (100/4 * 50ms)
            });
        }, 20);
    };

    const cancelPress = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setProgress(0);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <Container
            size="xs"
            py="xl"
            style={{
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
        >
            <Card shadow="lg" radius="lg" padding="xl" withBorder style={{ textAlign: "center" }}>
                <Stack align="center" gap="xl">
                    <Text size="5rem">{currentPlayer.avatar}</Text>
                    <Title order={2}>ส่งอุปกรณ์ให้คนถัดไป</Title>
                    <Title order={1} c="orange">
                        {currentPlayer.name}
                    </Title>

                    {!showWord ? (
                        <Button
                            size="xl"
                            color={progress > 0 ? "orange" : "gray"}
                            // Remove simple onClick
                            onMouseDown={startPress}
                            onMouseUp={cancelPress}
                            onMouseLeave={cancelPress}
                            onTouchStart={startPress}
                            onTouchEnd={cancelPress}
                            style={{
                                position: "relative",
                                overflow: "hidden",
                                transition: "color 0.2s",
                            }}
                            leftSection={<IconEye />}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${progress}%`,
                                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                                    transition: "width 0.05s linear",
                                }}
                            />
                            <span style={{ position: "relative", zIndex: 1 }}>
                                {progress > 0 ? "กำลังประมวลผล..." : "กดค้างเพื่อดูคำ"}
                            </span>
                        </Button>
                    ) : (
                        <Stack gap="md" w="100%">
                            <Text size="sm" c="dimmed">
                                บทบาทของคุณคือ
                            </Text>
                            <Title order={3}>{currentPlayer.role === "MR_WHITE" ? "Mr. White" : "Player"}</Title>

                            <Card bg="orange.1" radius="md" p="xl">
                                <Text
                                    mb={0}
                                    fw={900}
                                    c="orange.9"
                                    ta="center"
                                    style={{
                                        fontSize: "clamp(2rem, 8vw, 4rem)",
                                        lineHeight: 1.1,
                                        wordBreak: "break-word",
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    {currentPlayer.word}
                                </Text>
                            </Card>

                            <Text c="dimmed" size="xs">
                                จำคำของคุณไว้ให้ดี ห้ามให้ใครเห็น!
                            </Text>

                            <Button size="xl" color="orange" onClick={handleNext}>
                                เข้าใจแล้ว
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Card>
        </Container>
    );
};

const DiscussPhase = () => {
    const { startDiscussion, startingPlayerId, turnDirection, players } = useGameStore();
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [isActive, setIsActive] = useState(true);

    const startingPlayer = players.find((p) => p.id === startingPlayerId);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((t) => t - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <Container size="sm" py="xl">
            <Stack align="center" gap="xl" mt="xl">
                <Title order={1} size="3rem">
                    🗣️ Discussion
                </Title>
                <Text fz="xl" ta="center">
                    จับเวลาคุยกัน! ใครคือสายลับ?
                </Text>

                {/* Turn Order Info */}
                {startingPlayer && turnDirection && (
                    <Card withBorder radius="md" p="md" w="100%">
                        <Stack align="center" gap="xs">
                            <Text fw={700} c="dimmed">
                                เริ่มที่
                            </Text>
                            <Group>
                                <Text size="xl">{startingPlayer.avatar}</Text>
                                <Text size="xl" fw={800} c="orange">
                                    {startingPlayer.name}
                                </Text>
                            </Group>
                            <Group gap={5}>
                                <ThemeIcon
                                    variant="light"
                                    color={turnDirection === "CLOCKWISE" ? "teal" : "blue"}
                                    radius="xl"
                                >
                                    {turnDirection === "CLOCKWISE" ? <IconRefresh /> : <IconRefreshOff />}
                                </ThemeIcon>
                                <Text fw={600}>
                                    วนไปทาง: {turnDirection === "CLOCKWISE" ? "ซ้าย (ตามเข็ม)" : "ขวา (ทวนเข็ม)"}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                )}

                {/* Timer */}
                <Stack align="center" gap={0}>
                    <div
                        onClick={toggleTimer}
                        style={{
                            fontSize: "5rem",
                            fontWeight: "bold",
                            color: timeLeft <= 10 ? "red" : "#888",
                            cursor: "pointer",
                            fontVariantNumeric: "tabular-nums",
                            lineHeight: 1,
                        }}
                    >
                        {formatTime(timeLeft)}
                    </div>
                    {!isActive && (
                        <Text c="dimmed" size="sm">
                            (แตะเพื่อเริ่ม/หยุด)
                        </Text>
                    )}
                </Stack>

                {/* Player Status List */}
                <Card w="100%" radius="md" withBorder p="sm">
                    <Text size="sm" c="dimmed" mb="xs" ta="center">
                        สถานะผู้เล่น
                    </Text>
                    <SimpleGrid cols={4} spacing="xs">
                        {players.map((p) => (
                            <Stack
                                key={p.id}
                                align="center"
                                gap={0}
                                style={{ opacity: p.isAlive ? 1 : 0.3, filter: p.isAlive ? "none" : "grayscale(100%)" }}
                            >
                                <div style={{ position: "relative" }}>
                                    <Text size="1.5rem">{p.avatar}</Text>
                                    {!p.isAlive && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: -2,
                                                right: -2,
                                                color: "red",
                                                fontWeight: "bold",
                                                fontSize: "10px",
                                            }}
                                        >
                                            ❌
                                        </div>
                                    )}
                                </div>
                                <Text size="xs" truncate w="100%" ta="center" c={p.isAlive ? undefined : "dimmed"}>
                                    {p.name}
                                </Text>
                            </Stack>
                        ))}
                    </SimpleGrid>
                </Card>

                <Button size="xl" radius="xl" color="orange" onClick={startDiscussion}>
                    หมดเวลาโหวต!
                </Button>
            </Stack>
        </Container>
    );
};

const VotePhase = () => {
    const { players, eliminatePlayer } = useGameStore();
    const alivePlayers = players.filter((p) => p.isAlive);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    const handleVote = () => {
        if (selectedId) {
            eliminatePlayer(selectedId);
            close();
            setSelectedId(null);
        }
    };

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <Title ta="center">👉 โหวตคนออกจากเกม</Title>
                <SimpleGrid cols={3}>
                    {alivePlayers.map((p) => (
                        <Card
                            key={p.id}
                            onClick={() => {
                                setSelectedId(p.id);
                                open();
                            }}
                            withBorder
                            style={{
                                cursor: "pointer",
                                borderColor: selectedId === p.id ? "orange" : undefined,
                                borderWidth: selectedId === p.id ? 2 : 1,
                            }}
                        >
                            <Stack align="center" gap={0}>
                                <Text size="3rem">{p.avatar}</Text>
                                <Text fw={600} truncate w="100%" ta="center">
                                    {p.name}
                                </Text>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            </Stack>

            <Modal opened={opened} onClose={close} title="ยืนยันโหวต" centered>
                <Text ta="center" mb="lg">
                    มั่นใจนะว่าจะโหวตคนนี้?
                </Text>
                <Group justify="center">
                    <Button color="gray" onClick={close}>
                        ยกเลิก
                    </Button>
                    <Button color="red" onClick={handleVote}>
                        โหวตออกเลย!
                    </Button>
                </Group>
            </Modal>
        </Container>
    );
};

const RoundSummary = () => {
    const { players, lastEliminatedPlayerId, startNextRound } = useGameStore();
    const eliminatedPlayer = players.find((p) => p.id === lastEliminatedPlayerId);

    if (!eliminatedPlayer) return null;

    const getRoleText = (role: string | null) => {
        if (role === "CIVILIAN") return "Civilian (พลเมืองดี)";
        if (role === "UNDERCOVER") return "Undercover (สายลับ)";
        if (role === "MR_WHITE") return "Mr. White";
        return "Unknown";
    };

    const getRoleColor = (role: string | null) => {
        if (role === "CIVILIAN") return "teal";
        if (role === "UNDERCOVER") return "red";
        return "gray";
    };

    return (
        <Container size="sm" py="xl">
            <Center h="80vh">
                <Stack align="center" gap="xl">
                    <Title order={2} ta="center">
                        โหวตเสร็จสิ้น!
                    </Title>
                    <Card withBorder radius="lg" p="xl" style={{ textAlign: "center" }}>
                        <Stack align="center">
                            <Text size="5rem">{eliminatedPlayer.avatar}</Text>
                            <Title order={3}>{eliminatedPlayer.name}</Title>
                            <Text>คือ...</Text>
                            <Badge size="xl" color={getRoleColor(eliminatedPlayer.role)} p="lg">
                                <Text size="lg">{getRoleText(eliminatedPlayer.role)}</Text>
                            </Badge>
                        </Stack>
                    </Card>

                    <Button size="xl" color="orange" onClick={startNextRound}>
                        ไปต่อ (เริ่มรอบถัดไป)
                    </Button>
                </Stack>
            </Center>
        </Container>
    );
};

const MrWhiteGuessScreen = () => {
    const { makeMrWhiteGuess } = useGameStore();

    return (
        <Container size="sm" h="100vh">
            <Center h="100%">
                <Stack gap="xl" align="center">
                    <ThemeIcon size={100} color="gray" variant="light" radius="100%">
                        <IconGhost size={60} />
                    </ThemeIcon>
                    <Title ta="center">Mr. White ถูกจับได้!</Title>
                    <Text ta="center" size="lg">
                        คุณมีโอกาสสุดท้าย... ทายคำของ Civilian ให้ถูกเพื่อขโมยชัยชนะ!
                    </Text>

                    <Card withBorder p="xl" radius="md">
                        <Text ta="center" fw={700} mb="md">
                            ทายถูกหรือไม่?
                        </Text>
                        <Group>
                            <Button color="red" size="lg" onClick={() => makeMrWhiteGuess(false)}>
                                ทายผิด
                            </Button>
                            <Button color="green" size="lg" onClick={() => makeMrWhiteGuess(true)}>
                                ทายถูก!
                            </Button>
                        </Group>
                    </Card>
                </Stack>
            </Center>
        </Container>
    );
};

const ResultPhase = () => {
    const { winner, players, currentWordPair, resetGame } = useGameStore();

    const getWinnerText = () => {
        if (winner === "CIVILIAN") return "Civilians Win! 🎉";
        if (winner === "UNDERCOVER") return "Undercover Wins! 🕵️";
        if (winner === "MR_WHITE") return "Mr. White Wins! 👻";
        return "Game Over";
    };

    const getRoleColor = (role: string | null) => {
        if (role === "CIVILIAN") return "teal";
        if (role === "UNDERCOVER") return "red";
        return "gray";
    };

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <Card bg="var(--mantine-color-body)" withBorder radius="lg" p="xl">
                    <Stack align="center">
                        <ThemeIcon size={80} radius="xl" color={winner === "CIVILIAN" ? "teal" : "red"}>
                            <IconTrophy size={40} />
                        </ThemeIcon>
                        <Title ta="center" order={1}>
                            {getWinnerText()}
                        </Title>

                        <Group>
                            <Badge size="lg" color="teal">
                                Civ: {currentWordPair?.[0]}
                            </Badge>
                            <Badge size="lg" color="red">
                                Und: {currentWordPair?.[1]}
                            </Badge>
                        </Group>
                    </Stack>
                </Card>

                <Title order={3}>เฉลยตัวตน</Title>
                <Stack gap="xs">
                    {players.map((p) => (
                        <Card
                            key={p.id}
                            withBorder
                            radius="md"
                            padding="sm"
                            bg={!p.isAlive ? "gray.1" : undefined}
                            style={{ opacity: !p.isAlive ? 0.6 : 1 }}
                        >
                            <Group justify="space-between">
                                <Group>
                                    <Text size="xl">{p.avatar}</Text>
                                    <Stack gap={0}>
                                        <Text fw={700}>{p.name}</Text>
                                        {!p.isAlive && (
                                            <Badge color="gray" size="xs">
                                                ELIMINATED
                                            </Badge>
                                        )}
                                    </Stack>
                                </Group>
                                <Badge color={getRoleColor(p.role)} size="lg">
                                    {p.role}
                                </Badge>
                            </Group>
                        </Card>
                    ))}
                </Stack>

                <Button size="xl" color="orange" onClick={resetGame}>
                    เล่นอีกครั้ง
                </Button>
            </Stack>
        </Container>
    );
};
