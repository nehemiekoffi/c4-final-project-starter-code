import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const logger = createLogger('attachmentUtils');


// TODO: Implement the fileStogare logic

export function getUploadUrl(imageId: string) {

    const expiration = parseInt(urlExpiration);

    const result = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: expiration
    })

    logger.info(`Upload Url generated : ${result}`)

    return result;
}