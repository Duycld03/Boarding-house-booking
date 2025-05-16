import { useNavigate } from "react-router-dom";
import { Button } from "antd";

function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="grid h-screen place-content-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-[20rem] font-black text-gray-200 dark:text-white">
          404
        </h1>

        <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
          Uh-oh!
        </p>

        <p className="mt-6 text-3xl text-gray-500 dark:text-gray-400">
          We can't find that page.
        </p>
        <Button
          size="large"
          onClick={() => navigate("/dashboard/account-management")}
          className="mt-8 bg-[#40BFFF] hover:bg-[#1999E3] w-80 text-white font-semibold py-2 px-6 rounded-xl transition duration-300 shadow-md hover:shadow-lg border-none"
        >
          OK
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
