function AccessDeniedPage() {
  // Import necessary hooks at the component level for better readability
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("access_token");

    // Any other logout actions you need
    // For example, clearing user context (this would need to be passed as a prop or used from context)

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="grid h-screen place-content-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-[20rem] font-black text-[#40BFFF] dark:text-white">
          403
        </h1>

        <p className="text-4xl font-bold tracking-tight text-gray-800 dark:text-gray-100 sm:text-6xl">
          Access Denied
        </p>

        <p className="mt-6 text-3xl text-gray-500 dark:text-gray-400">
          You don't have permission to access the admin dashboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="large"
            onClick={() => navigate("/")}
            className="mt-8 bg-[#40BFFF] hover:bg-[#1999E3] text-white font-semibold py-2 px-6 rounded-xl transition duration-300 shadow-md hover:shadow-lg border-none"
          >
            Go Back Login
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default AccessDeniedPage;
