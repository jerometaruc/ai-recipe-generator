import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

/*
 * Configures Amplify with backend outputs:
 * - Auth (Cognito)
 * - GraphQL API (AppSync)
 * - Region and environment info
 */
Amplify.configure(outputs);

/*
 * Generates a strongly-typed GraphQL client using the backend schema.
 * 
 * Connects the frontend to the backend GraphQL API and enables
 * queries like 'askBedrock' to be called like local functions.
 * 
 * Uses Cognito User Pool authentication via 'authMode: "userPool"'.
 */
const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

/*
 * Main React component for the AI Recipe Generator.
 * 
 * Handles user input, submits the ingredients to the backend,
 * and displays the AI-generated recipe response from Bedrock.
 */
function App() {
  const [result, setResult] = useState<string>(""); // Stores the AI-generated result
  const [loading, setLoading] = useState(false);  // Tracks loading state for UI feedback

   /*
    * Handles the form submission when the user enters ingredients.
    * 
    * - Extracts the ingredient input from the form.
    * - Sends a GraphQL query to the 'askBedrock' backend function.
    * - 'askBedrock' forwards the request to Amazon Bedrock (Claude 3 Sonnet).
    * - Sets the result in state for display.
    * 
    * @param event - The form submit event.
    */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Call the backend query with the ingredients array
      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients: [formData.get("ingredients")?.toString() || ""],
      });

      // If the query was successful, show the result from Bedrock
      if (!errors) {
        setResult(data?.body || "No data returned");
      } else {
        // Log errors for debugging if the query fails
        console.log(errors);
      }

    } catch (e) {
      // Catch network or unexpected errors
      alert(`An error occurred: ${e}`);
    } finally {
      // Always turn off loading, even on error
      setLoading(false);
    }
  };

  /*
   * Renders the UI:
   * - Title and description.
   * - Input form.
   * - Loading animation.
   * - Result output.
   */
  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">AI Recipe Generator</span>
        </h1>
        <p className="description">
          Type a few ingredients, and AI Recipe Generator will generate an all-new recipe.
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient 1, Ingredient 2, Ingredient 3, ..."
          />
          <button type="submit" className="search-button">
            Generate Recipe
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;
