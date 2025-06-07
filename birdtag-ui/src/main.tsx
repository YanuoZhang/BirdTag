import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from 'react-oidc-context';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_WeMcEKNPb", 
  client_id: "54j2queta9ns63t81tau6846j8", 
  redirect_uri: "http://localhost:5137",   
  response_type: "code",                   
  scope: "openid profile email",           
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
    
  </StrictMode>,
)
