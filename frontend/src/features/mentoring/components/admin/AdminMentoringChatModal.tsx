"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "@/components/modal/Modal";
import { fetchAdminChatHistory } from "../../api/mentoringApi";
import { ChatMessageResponse } from "../../api/types";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

interface AdminMentoringChatModalProps {
    open: boolean;
    onClose: () => void;
    matchingId: number | null;
    mentorName: string;
    menteeName: string;
    recruitmentTitle: string;
}

export function AdminMentoringChatModal({
    open,
    onClose,
    matchingId,
    mentorName,
    menteeName,
    recruitmentTitle
}: AdminMentoringChatModalProps) {
    const tModal = useI18n("mentoring.chatHistory.modal");

    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open || !matchingId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await fetchAdminChatHistory(matchingId);
                setMessages(res.data || []);
            } catch (e: unknown) {
                console.error(e);
                toast.error(tModal("messages.fetchFailed"));
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [open, matchingId, tModal]);

    useEffect(() => {
        if (messages.length > 0) {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <Modal open={open} onClose={onClose} title={tModal("title")}>
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", height: "60vh", minHeight: "400px" }}>
                <div style={{ marginBottom: 16, padding: "12px", background: "#f8f9fa", borderRadius: "8px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#333" }}>{recruitmentTitle}</h3>
                    <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#555" }}>
                        <span><strong>{tModal("labels.mentor")}:</strong> {mentorName}</span>
                        <span><strong>{tModal("labels.mentee")}:</strong> {menteeName}</span>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        background: "#f1f3f5",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}
                >
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>{tModal("loadingText")}</div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>{tModal("emptyText")}</div>
                    ) : (
                        messages.map((msg, idx) => {
                            const dateStr = new Date(msg.createdAt).toLocaleDateString();
                            const showDate =
                                idx === 0 ||
                                new Date(messages[idx - 1].createdAt).toLocaleDateString() !== dateStr;

                            return (
                                <React.Fragment key={`${msg.type}-${msg.id}`}>
                                    {showDate && (
                                        <div style={{ textAlign: "center", margin: "16px 0 8px" }}>
                                            <span
                                                style={{
                                                    background: "rgba(0,0,0,0.1)",
                                                    padding: "4px 12px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    color: "#555"
                                                }}
                                            >
                                                {dateStr}
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <div
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: msg.type === "QUESTION" ? "#e9ecef" : "#d0ebff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "bold",
                                                flexShrink: 0
                                            }}
                                        >
                                            {msg.senderName.charAt(0)}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
                                            <span
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    color: "#333",
                                                    marginBottom: "4px"
                                                }}
                                            >
                                                {msg.senderName}
                                            </span>
                                            <div
                                                style={{
                                                    background: msg.type === "QUESTION" ? "#fff" : "#e7f5ff",
                                                    padding: "10px 14px",
                                                    borderRadius: "0 12px 12px 12px",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                    fontSize: "14px",
                                                    lineHeight: "1.5",
                                                    color: "#333",
                                                    wordBreak: "break-word",
                                                    whiteSpace: "pre-wrap"
                                                }}
                                            >
                                                {msg.content}
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#999",
                                                    marginTop: "4px",
                                                    marginLeft: "4px"
                                                }}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}
                    <div ref={messageEndRef} />
                </div>
            </div>
            <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: "8px 16px",
                        background: "#dee2e6",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    {tModal("buttons.close")}
                </button>
            </div>
        </Modal>
    );
}
