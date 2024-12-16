
const {
    APIGatewayAuthorizerResult,
    APIGatewayTokenAuthorizerEvent,
    StatementEffect,
} = require("aws-lambda");
const dotenv = require("dotenv").config();

// dotenv.config();

exports.handler = async (event) => {

console.log("request", JSON.stringify(event));
    let policy;
    if (event.type !== 'TOKEN') {
        policy = generatePolicy('Unauthorized user', 'Deny', event.methodArn);
        return policy;
    }
    try {
        const encodedCreds = event.authorizationToken.split(' ').pop();
        const buffer = Buffer.from(encodedCreds, 'base64');
        const clientCreds = buffer.toString('utf-8').split('=');
        
        const [userName, password] = clientCreds;
        console.log("userName, password", JSON.stringify(clientCreds));
        const envUserPassword = process.env[userName];
        const result = !envUserPassword || envUserPassword !== password ? 'Deny' : 'Allow';
        if(result === 'Allow'){
            policy = generatePolicySuccess(encodedCreds, result, event.methodArn);}
        else{
            policy = generatePolicy(encodedCreds, result, event.methodArn, "Fobidden");
        }
        return policy;
    } catch (error) {
        policy = generatePolicy('Unauthorized user', 'Deny', event.methodArn, "");
        return policy;
    }
};

const generatePolicy = (principalId, result, resource, error) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: result,
                    Resource: resource
                }
            ]
        },
        context: {
            statusCode: error.includes('Unauthorized') ? 401 : 403,
          },
    };
};
const generatePolicySuccess = (principalId, result, resource) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: result,
                    Resource: resource
                }
            ]
        }
    };
};