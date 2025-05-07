function ErrorPage() {
  return (
    <div className="grid h-screen place-content-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-[20rem] font-black text-gray-200">404</h1>

        <p className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Uh-oh!
        </p>

        <p className="mt-6 text-3xl text-gray-500">We can't find that page.</p>

        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-primary px-10 py-8 text-2xl font-bold 
  text-white border-2 border-transparent hover:bg-transparent hover:border-primary 
  transition-all duration-300 focus:ring-4 focus:outline-none"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default ErrorPage;
