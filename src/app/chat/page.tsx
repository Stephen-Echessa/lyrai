import { Suspense } from "react";
import ChatInterface from "@/components/ChatInterface";

export const metadata = {
  title: "Chat - Lyr.AI",
  description: "Ask AI questions about uploaded Spotify tracks",
};

export default function ChatPage() {
  return (
    // Full viewport chat page with no inner white panels to match design
    <div className="min-h-screen w-full">
      <Suspense fallback={null}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
