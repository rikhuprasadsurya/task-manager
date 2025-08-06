import {ITask} from "./task.model";

export interface PaginationResult {
    pageNumber: number,
    pageSize: number,
    total: number,
    tasks: ITask[]
}