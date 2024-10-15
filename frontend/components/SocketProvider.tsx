"use client";
import { Comment, FundData, FundsData, RecentDonator, SocketContextType, WebSocketMessage } from "@/backend";
import { setToastParam } from "@/utils";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

//provides socket connection only to authenticated clients
export const SocketProvider : React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket>();
  const [isAuthenticated, setisAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [fundsData, setFundsData] = useState<FundsData>([])
  const [loaded, setLoaded] = useState<boolean>(false)
  
  //fundId -> index
  const fundIdMap = useRef<Map<number, number>>(new Map());

  //for session identifier
  const tempId = useRef<string>("")

  const setId = (id : string) => {
    setUserId(id);
  };

  const login = () => {
    setisAuthenticated(true);
  };

  const logout = () => {
    socket?.close(1000)
    setisAuthenticated(false);
  };

  const setData = (data: FundsData)=>{
    setFundsData(data)
  }

  const setTempId = (id: string) =>{
    tempId.current = id
  }

  const sendCookie = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/verifyToken",
        {
          method: "POST",
          credentials: "include",
        }
      );
  
      if (res.ok) {
        const id = await res.text();
        setId(id);
        login();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error sending cookie:", error);
      return false;
    }
  };

  const fetchFundsData = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/fundsData",{ method: "GET" ,credentials: "include"});

    if(res.status==403){
      logout()
      return
    }

    const fundsData : FundsData =  await res.json()

    for(let i=0;i<fundsData.length;i++){
      fundIdMap.current.set(fundsData[i].id, i)
    }

    setFundsData(fundsData)
    setLoaded(true)
  }

  const connectWebSocket = () => {
    const s = new WebSocket(process.env.NEXT_PUBLIC_WS || "ws://localhost:8080/ws")
    s.onopen = () => {
      console.log('WebSocket connection established');
      console.log(userId)
      
      s.send(JSON.stringify({event: "paymentCompletedCheck", message: "Check if client made any donations!!", content: {userId: userId}}));
      
      if (tempId.current !== ""){
        s.send(JSON.stringify({event: "removeIdentifier", message: "Remove Temp Id!!", content: {userId: tempId.current}}));
        setTempId("")
      }
    
    };

    s.onclose = () => {
      console.log('WebSocket connection closed');
    };

    s.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    s.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('Received JSON data:', data);
        // Process the data based on its type or content
        switch (data.event) {
          case 'paymentCompletedCheck':
          
            if(data.content.amount > 0) toast.success("Donated Successfully", setToastParam(3000, "top-right"));

            s.send(JSON.stringify({event: "removePaymentCheck", message: "Remove the userId from paymentCheck!!", content: {userId: userId}}));

            break;
          case 'donationBroadcast':
            console.log("Broadcast: ")
            
            const index = fundIdMap.current.get(Number(data.content.fundId));
            const newFundData : FundData = {...fundsData[index!]}

            const recentDonatorObj : RecentDonator = {
                id: Math.floor(Math.random() * 2e10),
                fund_id: data.content.fundId,
                donator: data.content.donator,
                amount: Number(data.content.amount)
            }

            const commentObj : any = structuredClone(recentDonatorObj);
            if(data.content.comment !== ""){
                commentObj["comment"] = data.content.comment;
                newFundData.comments.unshift(commentObj)
            }

            newFundData.donation_num += 1
            newFundData.total_donation += Number(data.content.amount)
            newFundData.recentdonators.unshift(recentDonatorObj)

            const updatedFundsData = [...fundsData];
            updatedFundsData[index!] = newFundData;
            
            setFundsData(updatedFundsData)
            break;
          default:
            console.log('Unknown message type:', data.message);
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
      }
    };
  

    //s.send("storeClientInfo", userId);
    setSocket(s);

    console.log("Provider: Connected");

    return () => {
      s.close();
    };
  }
  

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if(!loaded){
        fetchFundsData()
      }else{
        connectWebSocket()
      }
     
    }
  }, [isAuthenticated, loaded]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        login,
        logout,
        isAuthenticated,
        setId,
        userId,
        sendMessage,
        fundsData,
        setData,
        fundIdMap,
        setTempId,
        sendCookie
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
