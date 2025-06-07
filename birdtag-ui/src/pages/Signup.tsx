import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const region = "ap-southeast-2";
  const clientId = "54j2queta9ns63t8t1au6846j8";
  const COGNITO_ENDPOINT = `https://cognito-idp.${region}.amazonaws.com/`;
  const HEADERS = {
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
  };
    // Form state

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation state

  const [emailValid, setEmailValid] = useState(false);
  // const [formValid, setFormValid] = useState(false);

  // Error messages
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Email validation
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("Email is required");
      setEmailValid(false);
    } else if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      setEmailValid(false);
    } else {
      setEmailError("");
      setEmailValid(true);
    }
  };
  const navigate = useNavigate();

  // Handle form submission
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setFormError("");
  setFormSuccess("");

  try {
    const res = await fetch(COGNITO_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setFormSuccess("Sign-up successful! Please check your email.");
      navigate(`/confirm?email=${encodeURIComponent(email)}`);
    } else {
      setFormError(data.message || "Sign-up failed.");
    }
  } catch (err) {
    setFormError("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};  
 return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
            <i className="fas fa-dove text-white text-2xl"></i>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          BirdTag
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account to start tracking birds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <p>{formError}</p>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              <p>{formSuccess}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    emailError ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="you@example.com"
                />
                {email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {emailValid ? (
                      <i className="fas fa-check-circle text-green-500"></i>
                    ) : (
                      <i className="fas fa-times-circle text-red-500"></i>
                    )}
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300
                  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Min 8 characters with uppercase, lowercase, number, symbol"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <i
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
              </div>
              
            </div>

            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !rounded-button whitespace-nowrap `}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 BirdTag. All rights reserved.</p>
      </div>
    </div>
 );
}
export default Signup;