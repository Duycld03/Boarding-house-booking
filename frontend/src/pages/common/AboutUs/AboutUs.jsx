function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-5">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Us</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to our website! We are passionate about delivering exceptional
          services and creating meaningful experiences for our users. Our
          mission is to innovate and provide the best solutions tailored to your
          needs.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-80">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Our Mission
          </h3>
          <p className="text-gray-600">
            Our mission is to deliver high-quality services that help you
            achieve your goals and dreams.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-80">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Our Vision
          </h3>
          <p className="text-gray-600">
            We strive to be the leading provider of innovative solutions,
            trusted by our users worldwide.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-80">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Our Values
          </h3>
          <p className="text-gray-600">
            Integrity, innovation, and customer satisfaction are at the core of
            everything we do.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {/* Team Member 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-800">John Doe</h4>
            <p className="text-gray-600">CEO & Founder</p>
          </div>

          {/* Team Member 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-800">Jane Smith</h4>
            <p className="text-gray-600">CTO</p>
          </div>

          {/* Team Member 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-800">
              Alex Johnson
            </h4>
            <p className="text-gray-600">Marketing Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
