import { useState, useEffect, useCallback } from "react";
import { fetchMyMatchings, fetchChatHistory } from "../api/mentoringApi";
import { MentoringMatchingResponse, ChatMessageResponse } from "../api/types";

export const useMentoringChat = () => {
    const [matchings, setMatchings] = useState<MentoringMatchingResponse[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);

    const loadRooms = useCallback(async () => {
        setLoadingRooms(true);
        try {
            const res = await fetchMyMatchings();
            const data = res.data || [];
            setMatchings(data);
            if (data.length > 0 && !selectedId) {
                setSelectedId(data[0].matchingId);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingRooms(false);
        }
    }, [selectedId]);

    const loadChat = useCallback(async (matchingId: number) => {
        setLoadingChat(true);
        try {
            const res = await fetchChatHistory(matchingId);
            setMessages(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingChat(false);
        }
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    useEffect(() => {
        if (selectedId) {
            loadChat(selectedId);
        }
    }, [selectedId, loadChat]);

    return {
        matchings,
        selectedId,
        setSelectedId,
        messages,
        setMessages,
        loadingRooms,
        loadingChat,
        refreshRooms: loadRooms,
        refreshChat: () => selectedId && loadChat(selectedId)
    };
};
