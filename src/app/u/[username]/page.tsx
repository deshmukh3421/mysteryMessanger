"use client";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // ✅ new toaster

const Page = () => {
  const params = useParams();
  const schema = z.object({
    message: z.string().min(1, "Message should not be empty"),
  });
  const [messages, setMessages] = useState<string[]>([]);
  const [acceptConditionError, setAcceptConditionError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestMessageLoader, setSuggestMessageLoader] =
    useState<boolean>(false);

  const { data: session } = useSession();

  const dummyMessages = [
    "Hello! How are you today?",
    "I hope you're having a great day!",
    "Feel free to reach out if you need anything.",
  ];

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const isAcceptingMessagesStatus = await axios.get("/api/accept-messages");

      if (isAcceptingMessagesStatus?.data?.isAcceptingMessages === true) {
        await axios.post("/api/send-message", {
          username: params.username,
          content: data.message,
        });

        toast.success("Message Sent Successfully ✅");
      } else {
        setAcceptConditionError("User does not accept messages");
        toast.error("User does not accept messages ❌");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message || "Something went wrong!";
      toast.error(errorMessage);
    } finally {
      reset();
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: string) => {
    setValue("message", message);
    setAcceptConditionError("");
    await trigger("message");
  };

  const suggestMessageFunction = async () => {
    setSuggestMessageLoader(true);
    try {
      const response = await axios.get("https://dummyjson.com/quotes/random/3");
      const data = response?.data;
      const newMessages = data.map((quote: any) => quote.quote);
      setMessages(newMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message || "Failed to fetch suggestions";
      toast.error(errorMessage);
    } finally {
      setSuggestMessageLoader(false);
    }
  };

  useEffect(() => {
    setMessages(dummyMessages);
  }, []);

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-4xl font-bold mb-4 text-center">
          Public Profile Link
        </h1>
        {acceptConditionError ? (
          <p className="text-sm text-red-500">User does not accept messages</p>
        ) : (
          <p className="text-sm font-semibold w-full">
            Send Anonymous Message to @{params.username}
          </p>
        )}

        <div className="mt-1 mb-3">
          <textarea
            id="message"
            className="w-full h-[5rem] outline-none border bordre-gray-200 p-2 rounded-md text-sm"
            placeholder="Write your anonymous message here"
            {...register("message")}
          ></textarea>
          {errors?.message && (
            <p className="text-sm text-red-500">
              {errors?.message?.message as string}
            </p>
          )}
        </div>
        <div className="flex justify-center items-center">
          <Button type="submit" disabled={!isValid}>
            {loading ? (
              <Loader2 className="animate-spin text-white" />
            ) : (
              "Send It"
            )}
          </Button>
        </div>
      </form>
      <div className="my-8">
        <Button onClick={() => suggestMessageFunction()}>
          {suggestMessageLoader ? (
            <Loader2 className="animate-spin text-white" />
          ) : (
            "Suggest Messages"
          )}
        </Button>
        <p className="my-3">Click on any message below to select it.</p>
        <div className="h-full w-full border border-gray-200 rounded-md p-5">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Messages</h3>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              {messages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2 w-full text-wrap p-2 min-h-fit h-full"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
