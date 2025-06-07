import React, { useState, useEffect } from "react";

const Signup = () => {
    // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [usernameValid, setUsernameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Error messages
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate form fields
  useEffect(() => {
    setFormValid(usernameValid && emailValid && passwordValid);
  }, [usernameValid, emailValid, passwordValid]);

  // Username validation
  const validateUsername = (value: string) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!value) {
      setUsernameError("Username is required");
      setUsernameValid(false);
    } else if (!usernameRegex.test(value)) {
      setUsernameError("Username must be 3-20 alphanumeric characters");
      setUsernameValid(false);
    } else {
      setUsernameError("");
      setUsernameValid(true);
    }
  };

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

  // Password validation and strength calculation
  const validatePassword = (value: string) => {
    // Password requirements: min 8 chars, upper/lower case, number, symbol
    const lengthValid = value.length >= 8;
    const uppercaseValid = /[A-Z]/.test(value);
    const lowercaseValid = /[a-z]/.test(value);
    const numberValid = /[0-9]/.test(value);
    const symbolValid = /[^A-Za-z0-9]/.test(value);

    // Calculate strength (0-4)
    const strength =
      [
        lengthValid,
        uppercaseValid,
        lowercaseValid,
        numberValid,
        symbolValid,
      ].filter(Boolean).length - 1;
    setPasswordStrength(Math.max(0, strength));

    if (!value) {
      setPasswordError("Password is required");
      setPasswordValid(false);
    } else if (!lengthValid) {
      setPasswordError("Password must be at least 8 characters");
      setPasswordValid(false);
    } else if (
      !(uppercaseValid && lowercaseValid && numberValid && symbolValid)
    ) {
      setPasswordError(
        "Password must include uppercase, lowercase, number, and symbol",
      );
      setPasswordValid(false);
    } else {
      setPasswordError("");
      setPasswordValid(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formValid) return;

    setIsLoading(true);

    // Simulate API call to Cognito
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful registration
      // In a real app, you would call Cognito here:
      // await Auth.signUp({
      //   username: email,
      //   password,
      //   attributes: {
      //     email,
      //     preferred_username: username,
      //   }
      // });

      setFormSuccess(
        "Sign-up successful! Please check your email for a verification code.",
      );

      // Reset form after successful submission
      setUsername("");
      setEmail("");
      setPassword("");
      setPasswordStrength(0);

      // Redirect to verification page after a delay
      setTimeout(() => {
        // In a real app, you would use router navigation here
        console.log("Redirecting to verification page...");
      }, 2000);
    } catch (error) {
      // Simulate different error scenarios
      const randomError = Math.floor(Math.random() * 3);

      if (randomError === 0) {
        setFormError("An account with this email already exists.");
      } else if (randomError === 1) {
        setFormError("This username is already in use.");
      } else {
        setFormError(
          "An error occurred during registration. Please try again.",
        );
      }
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
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Username
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    validateUsername(e.target.value);
                  }}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    usernameError ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Choose a username (3-20 characters)"
                />
                {username && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {usernameValid ? (
                      <i className="fas fa-check-circle text-green-500"></i>
                    ) : (
                      <i className="fas fa-times-circle text-red-500"></i>
                    )}
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="mt-2 text-sm text-red-600">{usernameError}</p>
              )}
            </div>

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
                    validatePassword(e.target.value);
                  }}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    passwordError ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Password strength:</p>
                    <p className="text-xs font-medium">
                      {passwordStrength === 0 && "Very weak"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Medium"}
                      {passwordStrength === 3 && "Strong"}
                      {passwordStrength === 4 && "Very strong"}
                    </p>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        passwordStrength === 0
                          ? "bg-red-500"
                          : passwordStrength === 1
                            ? "bg-orange-500"
                            : passwordStrength === 2
                              ? "bg-yellow-500"
                              : passwordStrength === 3
                                ? "bg-green-500"
                                : "bg-green-600"
                      }`}
                      style={{ width: `${(passwordStrength + 1) * 20}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={!formValid || isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !rounded-button whitespace-nowrap ${
                  !formValid || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
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
                href="#"
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