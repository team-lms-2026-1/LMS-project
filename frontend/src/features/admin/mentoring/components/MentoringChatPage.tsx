"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./MentoringChat.module.css";
import { sendQuestion, sendAnswer, fetchChatHistory } from "../api/mentoringApi";
import { useMentoringChat } from "../hooks/useMentoringChat";
import { useAuth } from "@/features/auth/AuthProvider";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

interface Props {
    userRole: "student" | "professor";
}

export default function MentoringChatPage({ userRole }: Props) {
    const tChat = useI18n("mentoring.chat");
    const { state } = useAuth();
    const myAccountId = state.me?.accountId;

    const {
        matchings,
        selectedId,
        setSelectedId,
        messages,
        setMessages,
        loadingRooms,
        refreshChat
    } = useMentoringChat(userRole);

    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);

    const messageEndRef = useRef<HTMLDivElement>(null);

    const activeRoom = useMemo(() => matchings.find((m) => m.matchingId === selectedId), [matchings, selectedId]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!selectedId) return;

        const timer = setInterval(async () => {
            try {
                const res = await fetchChatHistory(userRole, selectedId);
                const data = res.data;
                setMessages((prev) => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
                    return prev;
                });
            } catch {
                // Ignore polling errors and keep previous messages.
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [selectedId, setMessages, userRole]);

    const handleSend = async () => {
        if (!inputValue.trim() || !activeRoom || sending) return;

        try {
            setSending(true);
            if (activeRoom.role === "MENTEE") {
                await sendQuestion(userRole, {
                    matchingId: activeRoom.matchingId,
                    content: inputValue
                });
            } else {
                const lastQuestion = [...messages].reverse().find((m) => m.type === "QUESTION");

                if (lastQuestion) {
                    await sendAnswer(userRole, {
                        questionId: lastQuestion.id,
                        content: inputValue
                    });
                } else {
                    await sendQuestion(userRole, {
                        matchingId: activeRoom.matchingId,
                        content: inputValue
                    });
                }
            }
            setInputValue("");
            refreshChat();
            setTimeout(scrollToBottom, 50);
        } catch (e: unknown) {
            console.error(e);
            const message = e instanceof Error ? e.message : "";
            toast.error(tChat("messages.sendFailedPrefix") + (message || tChat("messages.unknownError")));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarTitle}>{tChat("title")}</div>
                <div className={styles.roomList}>
                    {loadingRooms ? (
                        <div style={{ padding: 20, textAlign: "center", color: "#999" }}>{tChat("sidebar.loadingText")}</div>
                    ) : matchings.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", color: "#999" }}>{tChat("sidebar.emptyText")}</div>
                    ) : (
                        matchings.map((room) => (
                            <div
                                key={room.matchingId}
                                className={`${styles.roomItem} ${selectedId === room.matchingId ? styles.active : ""}`}
                                onClick={() => setSelectedId(room.matchingId)}
                            >
                                <div className={styles.roomAvatar}>{room.partnerName?.charAt(0) ?? "?"}</div>
                                <div className={styles.roomInfo}>
                                    <span className={styles.partnerName}>
                                        {room.partnerName}{" "}
                                        <span style={{ fontWeight: 400, color: "#9aa3b0" }}>
                                            ({room.role === "MENTOR" ? tChat("sidebar.partnerRole.mentee") : tChat("sidebar.partnerRole.mentor")})
                                        </span>
                                    </span>
                                    <span className={styles.recruitmentTitle}>{room.recruitmentTitle}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.chatContainer}>
                {activeRoom ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderAvatar}>{activeRoom.partnerName?.charAt(0) ?? "?"}</div>
                            <div className={styles.chatHeaderInfo}>
                                <div className={styles.chatPartnerName}>{activeRoom.partnerName}</div>
                                <div className={styles.chatInfo}>{activeRoom.recruitmentTitle}</div>
                            </div>
                        </div>

                        <div className={styles.messageArea}>
                            {messages.map((msg, idx) => {
                                const isMine = !!(myAccountId && msg.senderId === myAccountId);
                                const dateStr = new Date(msg.createdAt).toLocaleDateString();
                                const showDate = idx === 0 || new Date(messages[idx - 1].createdAt).toLocaleDateString() !== dateStr;

                                return (
                                    <div key={`${msg.type}-${msg.id}`}>
                                        {showDate && (
                                            <div className={styles.dateDivider}>
                                                <span className={styles.dateText}>{dateStr}</span>
                                            </div>
                                        )}
                                        <div className={`${styles.messageRow} ${isMine ? styles.myMessage : styles.partnerMessage}`}>
                                            {!isMine && <div className={styles.messageSender}>{msg.senderName}</div>}
                                            <div className={styles.messageContentWrapper}>
                                                <div className={styles.messageTime}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                                <div className={styles.bubble}>{msg.content}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        <div className={styles.inputArea}>
                            <textarea
                                className={styles.textarea}
                                placeholder={tChat("input.placeholder")}
                                value={inputValue}
                                maxLength={200}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <div className={styles.inputFooter}>
                                <span
                                    className={styles.charCount}
                                    style={{ color: inputValue.length >= 200 ? "#ef4444" : undefined }}
                                >
                                    {inputValue.length}/200
                                </span>
                                <button
                                    className={styles.sendButton}
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || sending}
                                >
                                    {tChat("input.send")}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💬</div>
                        <h3>{tChat("emptyState.title")}</h3>
                        <p>{tChat("emptyState.description")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
