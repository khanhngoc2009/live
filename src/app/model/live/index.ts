import { StringifyOptions } from "querystring";
import { Message } from "../message";

export interface Live {
    id?:string,
    uid?:number,
    channel?:string,
    token?:any,
    users?:number,
    appId?:string,
    messages?:Message[]
    status?:boolean
}