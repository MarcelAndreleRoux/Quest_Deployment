import { AuthProviderProps } from "react-oidc-context";

export const CognitoAuthConfig: AuthProviderProps = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_y90MOrfAw",
  client_id: "8v7j9shv683p12k78rcdmjfl2",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "code",
  scope: "openid profile email",
};