import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ConfirmSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email =
    searchParams.get("email") || localStorage.getItem("pendingEmail") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const region = "ap-southeast-2";
  const clientId = "54j2queta9ns63t8t1au6846j8";
  useEffect(() => {
    if (!email) {
      setError("No email provided. Please go back to sign up.");
    }
  }, [email]);


  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !code) {
      setError("Please enter the confirmation code.");
      return;
    }

    setIsLoading(true);
    try {
    //   const response = await fetch(`https://cognito-idp.${process.env.REACT_APP_REGION}.amazonaws.com/`, {
    const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
        },
        body: JSON.stringify({
        //   ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
          ClientId:clientId,
          Username: email,
          ConfirmationCode: code,
        }),
      });

      const data = await response.json();

      if (data.__type || data.message) {
        throw new Error(data.message || data.__type);
      }

      setSuccess("Verification successful! You can now sign in.");
      localStorage.removeItem("pendingEmail");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError("Verification failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirm Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We’ve sent a code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleConfirm}>
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Confirmation Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter the 6-digit code"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Didn’t receive the code? <span className="text-blue-600">Check your spam folder</span> or{" "}
            <button className="underline text-blue-600">resend</button> (optional)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignup;
