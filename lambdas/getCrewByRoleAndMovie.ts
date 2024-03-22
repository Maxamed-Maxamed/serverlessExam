import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event) => {
  const { role, movieId } = event.pathParameters;
  const subString = event.queryStringParameters ? event.queryStringParameters.name : undefined;

  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.MOVIE_CREW_TABLE_NAME as string,
    KeyConditionExpression: '#role = :role and begins_with(movieId, :movieId)',
    ExpressionAttributeNames: {
      '#role': 'crewRole',
      ...(subString && { '#name': 'name' }),
    },
    ExpressionAttributeValues: {
      ':role': role,
      ':movieId': movieId,
      ...(subString && { ':subString': subString }),
    },
    ...(subString && { FilterExpression: 'contains(#name, :subString)' }),
  };

  try {
    const data = await dynamoDb.query(params).promise();

    
    const items = data.Items ? data.Items : [];

    const filteredItems = subString
      ? items.filter(item => item.name && item.name.includes(subString))
      : items;

    return {
      statusCode: 200,
      body: JSON.stringify(filteredItems),
    };
  } catch (error) {
    console.error('Query failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.toString() }),
    };
  }
};
