import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const region = "ap-southeast-2";
  const clientId = "54j2queta9ns63t8t1au6846j8";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: clientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        }),
      });

      const data = await response.json();

      if (data.AuthenticationResult?.IdToken) {
        localStorage.setItem("idToken", data.AuthenticationResult.IdToken);
        localStorage.setItem("accessToken", data.AuthenticationResult.AccessToken);
        localStorage.setItem("refreshToken", data.AuthenticationResult.RefreshToken);
        alert("Login successful!");
        navigate("/"); 
      } else {
        console.error("Login failed:", data);
        alert("Login failed: " + (data.message || data.__type || "Unknown error"));
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred while logging in.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>


          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
