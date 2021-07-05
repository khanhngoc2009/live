import { User } from "../../../model";

export interface GenericListInitialState<T> {
    isLoading?: boolean
    error?: Error | null | boolean
    data?: T[]
    paging?: {
        page: number
        per_page: number
    }
    isLoadMore?:boolean
    page?:number
    listUser?:User[];
    isLogin?:boolean;
    userLogin?:User;
    success_message?:string,
    sentry_detail?:T
}