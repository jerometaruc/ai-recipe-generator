import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

/*
 * Defines the Amplify backend configuration by registering:
 * 
 * - 'auth': Cognito User Pool for user authentication.
 * - 'data': GraphQL API automatically generated from in './data/resource.ts'.
 * 
 * The GraphQL API is powered by AWS AppSync and automatically deployed
 * based on the 'defineData()' schema in './data/resource.ts'.
 */
const backend = defineBackend({
  auth,
  data,
});

/*
 * Adds a custom HTTP data source to the GraphQL API that connects to
 * Amazon Bedrock's runtime endpoint.
 * 
 * Enables the GraphQL resolver ('askBedrock') to make external 
 * HTTP requests to the Bedrock model (Claude 3 Sonnet).
 * 
 * The returned object ('bedrockDataSource') is an AppSync HTTP data
 * source instance, accessible via 'backend.data.resources.graphqlApi'.
 */
const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.us-east-1.amazonaws.com",
  {
    authorizationConfig: {
      signingRegion: "us-east-1",
      signingServiceName: "bedrock",
    },
  }
);

/*
 * Grants the GraphQL API permission to invoke a specific Bedrock model
 * (in this case, Claude 3 Sonnet) via IAM.
 * 
 * This policy ensures the backend can securely send requests to
 * 'bedrock:InvokeModel' for that model ARN.
 */
bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
    ],
    actions: ["bedrock:InvokeModel"],
    
  })
);
