"use client";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner"; // ✅ new sonner toast

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const handleDeleteConfirm = async () => {
    onMessageDelete(message._id as string);
    try {
      const response = await axios.delete<ApiResponse>(
        `api/delete-message/${message._id}`
      );
      if (response.status === 200) {
        toast.success("Message deleted Successfully"); // ✅ success toast
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError?.response?.data?.message;
      toast.error(errorMessage || "Failed to delete message"); // ✅ error toast
    }
  };

  return (
    <Card>
      <CardHeader>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="w-full flex justify-end">
              <Button variant="destructive" className="w-fit">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>{message.content}</CardContent>
    </Card>
  );
};

export default MessageCard;
