import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthProvider";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "admin@hrms.com",
    password: "123456#erqe*&^%$E",
    rememberMe: false,
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "admin@hrms.com",
      password: "123456#erqe*&^%$E",
      rememberMe: false,
    },
  });

  const onSubmit = (data) => {
    // login function from AuthProvider
    if (login(data.email, data.password)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://revinns.com/wp-content/uploads/2023/03/E2-B-1.png"
              alt="image"
              width={170}
              height={170}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          {/* <p className="text-gray-500">Sign in to your HRMS account</p> */}
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...register("email", {
                  required: "Email is required",
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"} // FIXED HERE
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />

                {/* Eye Icon */}
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2 bg-[#02094c] text-white rounded-lg font-medium hover:bg-[#02094c] transition"
            >
              Sign In
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600 pt-2">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
