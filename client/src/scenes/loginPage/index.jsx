import Form from "./Form";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-neutral-900 transition-colors duration-300">
      <div className="w-full bg-white dark:bg-[#1A1A1A] p-6 text-center shadow-sm border-b border-neutral-100 dark:border-neutral-800 transition-colors duration-300">
        <h1 className="font-bold text-3xl text-blue-500">
          Connectto
        </h1>
      </div>

      <div className="w-[93%] lg:w-1/2 p-8 lg:p-12 my-12 mx-auto rounded-3xl bg-white dark:bg-[#1A1A1A] shadow-sm border border-neutral-100 dark:border-neutral-800 transition-colors duration-300">
        <h5 className="font-medium text-xl mb-8 text-neutral-800 dark:text-gray-100">
          Welcome to Connectto
        </h5>
        <Form />
      </div>
    </div>
  );
};

export default LoginPage;
