"use client";
import Main from "@/components/Main";
import { useSocket } from "@/components/SocketProvider";

export default function Home() {
  //const [socket, setSocket] = useState(null);
  const socket = useSocket();

  return (
    <div className="flex flex-col">
      <Main socket={socket} />
    </div>
  );
}
