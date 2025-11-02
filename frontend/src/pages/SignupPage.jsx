import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Brain, ArrowRight } from "lucide-react";
import api from "../api/axios.js";
import { useAuthStore } from "../stores/authStore";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, error, setError, clearError } = useAuthStore();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
        const res = await api.post("/auth/register", { name, email, password });
      return res.data;
    },
    onSuccess: (data) => {
      login(data);
      navigate("/");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Signup failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    clearError();
    mutation.mutate();
  };

  return (
    <div className="min-h-[calc(100vh-4rem-1px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 border rounded-full flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold font-schoolbell text-gray-600 mb-2">Join STEMforces</h2>
          <p className="text-gray-600 font-caveat text-2xl leading-3">Start your journey to STEM mastery</p>
        </div>

        {/* signup form */}
        <div className="card">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-black border-[.5px]  border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  className="form-input pl-10"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input pl-10"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary mx-w-3xl mx-auto flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-schoolbell text-xl">{mutation.isPending ? "Creating account..." : "Create Account"}</span>
              {!mutation.isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* additional */}
        <div className="text-center text-sm text-gray-500">
          <p>By signing up, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;