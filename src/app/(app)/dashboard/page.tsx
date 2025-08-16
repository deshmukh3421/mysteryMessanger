"use client";
import { toast } from "sonner";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/messageCard";
import { Switch } from "@/components/ui/switch";
import { User } from "next-auth";
import { useRouter } from "next/navigation";

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [acceptMessagesState, setAcceptMessagesState] = useState<boolean>(true);

  const { data: session, status } = useSession();
  const user: User = session?.user as User;
  const router = useRouter();

  const form = useForm({ resolver: zodResolver(acceptMessageSchema) });
  const { setValue } = form;

  // Generate profile link
  useEffect(() => {
    if (typeof window !== "undefined" && session?.user?.username) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${session.user.username}`);
    }
  }, [session?.user?.username]);

  // Fetch accept/reject state
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      if (response.data.success) {
        const isAccepting = response.data.isAcceptingMessage ?? true;
        setAcceptMessagesState(isAccepting);
        setValue("acceptMessages", isAccepting);
      } else {
        toast.error(response.data.message || "Failed to fetch message settings");
      }
    } catch (error) {
      toast.error("Failed to fetch message settings");
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  // Fetch messages
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/get-message");
      console.log("get-messages response:", response.data); // debug

      if (response.data.success) {
        setMessages(response.data.messages || []);
        if (refresh) {
          toast("Refreshed Messages", { description: "Showing latest messages" });
        }
      } else {
        toast.error(response.data.message || "Failed to fetch messages");
      }
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const newValue = !acceptMessagesState;
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: newValue,
      });
      if (response.data.success) {
        setAcceptMessagesState(newValue);
        setValue("acceptMessages", newValue);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update Accepting Message status");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const copyToClipboard = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast.success("Profile URL has been copied to clipboard");
      router.push(profileUrl);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex justify-center items-center text-center">
        Loading...
      </div>
    );
  }

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Profile Link */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2 text-sm"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Switch */}
      <div className="mb-4">
        <Switch
          checked={acceptMessagesState}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessagesState ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      {/* Refresh */}
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      {/* Messages */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
            No messages yet. Share your link and start receiving messages!
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
