/* 
 * Constructs HTTP request to invoke Amazon Bedrock model.
 *
 * This function is automatically called by Amplify's custom data source handler.
 * It receives the query input from the frontend (ingredients) via 'ctx.args',
 * and formats a prompt for Bedrock's Claude model.
 * 
 * @param {object} ctx - The context object containing query arguments.
 * @returns {object} - The HTTP request configuration for the Bedrock model.
 */
export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  
  // Construct the prompt with the provided ingredients
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;
  
  // Return the request configuration
  return {
    resourcePath: `/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `\n\nHuman: ${prompt}\n\nAssistant:`,
              },
            ],
          },
        ],
      }),
    },
  };
}

/* 
 * Processes the HTTP response from the Bedrock model.
 *
 * This function is automatically called after the 'request()' is fulfilled.
 * It parses the response returned by the Bedrock Claude model and extracts
 * the generated text content to send back to the client.
 *
 * @param {object} ctx - The context object containing the raw result from Bedrock.
 * @returns {object} - A simplified response object with the AI-generated recipe.
 */
export function response(ctx) {
  // Parse the response body
  const parsedBody = JSON.parse(ctx.result.body);

  // Extract the text content from the response
  const res = {
    body: parsedBody.content[0].text,
  };
  return res;
}
