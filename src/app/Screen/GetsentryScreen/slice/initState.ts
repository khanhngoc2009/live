import { GenericListInitialState } from "./GenericListInitialState";

export interface Sentry{
    id?:any,
    name?:string,
    full_name?:string,
    description?:string,
    language?:string,
    forks_count?:number,
    forks?:number,
    watchers?:number,
    open_issues?:number,
}
export const initialState: GenericListInitialState<Sentry> = {
    isLoading: false,
    error: null,
    data: [],
    sentry_detail:{}
}


