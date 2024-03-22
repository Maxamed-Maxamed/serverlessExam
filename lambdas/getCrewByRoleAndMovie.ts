import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event) => {
  // Extract 'role' and 'movieId' from the path parameters
  const { role, movieId } = event.pathParameters;

  // Ensure the environment variable for table name is defined
  const tableName = process.env.MOVIE_CREW_TABLE_NAME;
  if (!tableName) {
    console.error('Table name is undefined');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error: Table name is undefined' }),
    };
  }

  // Setting up parameters for the DynamoDB query
  const params = {
    TableName: tableName,
    IndexName: 'CrewRoleMovieIndex', // Ensure this index is set up in your DynamoDB table
    KeyConditionExpression: 'crewRole = :role and begins_with(movieId, :movieId)',
    ExpressionAttributeValues: {
      ':role': role,
      ':movieId': movieId,
    },
  };

  try {
    // Query the DynamoDB table for entries matching the role and movieId
    const data = await dynamoDb.query(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error('Error querying DynamoDB', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
