import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUploadUrl } from '../../helpers/attachmentUtils'
import { getTodoById } from '../../businessLogic/todos'
import { TodoAccess } from '../../helpers/todosAccess'

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const todoAccess = new TodoAccess();

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const todoId = event.pathParameters.todoId
        // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
        const todo = await getTodoById(todoId)
        todo.attachmentUrl = `http://${bucketName}.s3.amazonaws.com/${todoId}`;

        await todoAccess.updateAttachementUrl(todo);

        const uploadUrl = getUploadUrl(todoId)

        return {
            statusCode: 201,
            body: JSON.stringify({
                uploadUrl: uploadUrl
            })
        };
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
