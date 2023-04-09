import {createAction} from "@reduxjs/toolkit";
import {TasksStateType} from "features/TodolistsList/tasks-reducer";
import {TodolistDomainType} from "features/TodolistsList/todolists-reducer";

type ClearTasksAndTodolistsType = {
    tasks: TasksStateType,
    todolists: TodolistDomainType[]
}
export const clearTasksAndTodolists = createAction<ClearTasksAndTodolistsType>('common/clearTasksAndTodolists')
