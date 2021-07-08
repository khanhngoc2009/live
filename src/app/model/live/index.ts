import { StringifyOptions } from "querystring";
import { Message } from "../message";

export interface Live {
    id?:string,
    uid?:string,
    channel?:string,
    token?:string,
    users?:number,
    appId?:string,
    messages?:Message[]
}