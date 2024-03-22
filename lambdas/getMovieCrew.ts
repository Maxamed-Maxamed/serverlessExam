import { DynamoDB } from 'aws-sdk';
const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event) => {
  const { movieId } = event.pathParameters;

  const params = {
    TableName: 'MovieCrew',
    KeyConditionExpression: 'movieId = :movieId',
    ExpressionAttributeValues: {
      ':movieId': movieId,
    },
  };

  try {
    const data = await dynamoDb.query(params).promise();
    return { statusCode: 200, body: JSON.stringify(data.Items) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to get movie crew' }) };
  }
};