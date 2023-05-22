declare module '.jpg';
declare module '.svg';
declare module '.png';
declare module 'url:*' {
  export default string;
}
declare module '*.svg' {
  const content: any;
  export default content;
}
declare interface StoreObject {
  auth?: {
    userid: string;
    username: string;
    avatar: string;
    balance: number;
  };
  loading: boolean;
}

declare interface ProfitStatusObject { 
  diamond: string;
  color: string;
}

declare interface ProfitListObject { 
  label: string;
  value: number;
  status: ProfitStatusObject[];
}