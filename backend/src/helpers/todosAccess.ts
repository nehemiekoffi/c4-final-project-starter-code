import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const index = process.env.TODOS_CREATED_AT_INDEX

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos for a user')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items

        return items as TodoItem[]
    }

    async getTodoById(todoId: string): Promise<TodoItem> {
        logger.info('Getting todo by todoId - ' + todoId)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: index,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise()

        logger.info(
            'Getting getTodoById result',
            result
        )

        if (result.Count !== 0) {
            return result.Items[0] as TodoItem
        }

        return null
    }

    async updateTodo(todo: TodoItem): Promise<TodoItem> {

        logger.info('Updating todo - todoId: ' + todo.todoId)
        logger.info(
            'Todo to update',
            todo
        );

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: todo.userId,
                todoId: todo.todoId,
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':dueDate': todo.dueDate,
                ':done': todo.done,
                ':name': todo.name
            }
        }).promise()

        logger.info(`Todo updated - ${result}`)

        return result.Attributes as TodoItem
    }


    async updateAttachementUrl(todo: TodoItem): Promise<TodoItem> {

        logger.info('Updating updateAttachementUrl for todo - todoId: ' + todo.todoId)
        logger.info(
            'Todo to update',
            todo
        );

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: todo.userId,
                todoId: todo.todoId,
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': todo.attachmentUrl
            }
        }).promise()

        logger.info(`Todo updateAttachementUrl updated - ${result}`)

        return result.Attributes as TodoItem
    }

    async deleteTodo(todo: TodoItem): Promise<any> {

        logger.info('Deleting todo - todoId: ' + todo.todoId)

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: todo.userId,
                todoId: todo.todoId,
            },
        }).promise()

        return result;
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Creating new todo - ' + todo.name)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}