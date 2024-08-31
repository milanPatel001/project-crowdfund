export type FundsData = FundData[];

export type FundData = {
    id : number,
    name: string,
    story: string,
    beneficiary_name: string,
    place: string,
    title: string,
    img: string,
    created_at: string,
    goal: number,
    donation_num: number,
    total_donation: number,
    comments: Comment[],
    recentdonators: RecentDonator[]
}

export type RecentDonator = {
    id:number,
    fund_id: number,
    donator: number,
    amount: number
}

export type Comment = {
    id:number,
    fund_id: number,
    donator: number,
    amount: number,
    comment: string
}

export type TokenResponse = {
    jwtToken : string,
    refreshToken: string,
    passed : boolean
}

export type SignUpResponse = {
    passed : boolean,
    message : string
}

export type WebSocketMessage = {
    event: string,
    message: string,
    content: any
}

export type History = {
    id: number,
    beneficiary: string,
    amount: number,
    donated_at: string,
    organizer: string
}

export interface SocketContextType {
    socket: WebSocket | undefined;
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    setId: (string) => void;
    userId: string;
    sendMessage : (WebSocketMessage) => void,
    fundsData: FundsData,
    setData: (FundsData)=>void,
    fundIdMap: MutableRefObject<Map<number, number>>,
    setTempId: (string)=>void
  }
  