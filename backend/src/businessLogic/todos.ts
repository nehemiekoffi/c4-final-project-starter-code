import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoAccess } from '../helpers/todosAccess'
import { getUserId } from '../lambda/utils';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

// TODO: Implement businessLogic

const todoAccess = new TodoAccess()

export async function getTodosForUser(event): Promise<TodoItem[]> {
    const userId = getUserId(event)
    return todoAccess.getTodosForUser(userId);
}

export async function getTodoById(todoId): Promise<TodoItem> {
    return todoAccess.getTodoById(todoId);
}

export async function updateTodoFromRequest(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
): Promise<TodoItem> {

    const todo = await getTodoById(todoId);

    console.log(todo);

    todo.done = updateTodoRequest.done
    todo.dueDate = updateTodoRequest.dueDate
    todo.name = updateTodoRequest.name

    return await todoAccess.updateTodo(todo);
}


export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    event,
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = getUserId(event)

    return await todoAccess.createTodo({
        userId: userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
    })
}

export async function deleteTodoById(
    todoId: string
): Promise<any> {

    const todo = await getTodoById(todoId)

    return await todoAccess.deleteTodo(todo);
}
