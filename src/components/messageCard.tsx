"use client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Message } from "@/model/User";

interface MessageCardProps {
  message: Message;
  onMessageDelete: (id: string) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onMessageDelete }) => {
  return (
    <Card className="shadow-md rounded-2xl border border-gray-200 hover:shadow-lg transition">
      <CardHeader className="flex justify-between items-center pb-2">
        <span className="text-sm text-gray-500">
          {new Date(message.createdAt || "").toLocaleString()}
        </span>
        <Button
          size="icon"
          variant="destructive"
          className="rounded-full h-8 w-8"
          onClick={() => onMessageDelete(message._id as string)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-gray-900 text-base leading-relaxed">
          {message.content}
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
