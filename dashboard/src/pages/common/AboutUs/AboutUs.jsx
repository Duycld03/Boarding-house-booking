import React from "react";
import { TeamOutlined, AimOutlined, CodeOutlined } from "@ant-design/icons";

function AboutUs() {
  return (
    <div className="min-h-screen py-10 px-5">
      <header
        className="text-center mb-12 bg-cover bg-center bg-no-repeat py-20 px-4"
        style={{
          backgroundImage: `url('https://afamilycdn.com/150157425591193600/2022/9/30/hinh-anh-cac-sinh-vien-kien-truc-cung-nhau-lam-viec-nhom-16642466416561577942506-1664469958516-16644699587351209650787-1664506667990-1664506668496235501908.jpg')`,
        }}
      >
        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold text-white">
          We Are MotelLease Tech
        </h1>
        <p className="text-white mt-8 max-w-xl mx-auto text-base sm:text-lg lg:text-xl">
          At MotelLease Tech, we believe in simplifying the rental experience
          for everyone. Our platform bridges the gap between landlords and
          tenants by providing a seamless, efficient, and transparent rental
          process. From helping tenants find their ideal rental properties to
          giving landlords tools to manage their listings, we strive to make the
          process stress-free and modern.
        </p>
      </header>

      <div>
        <h2 className="text-4xl font-bold text-blue-600 mb-4 text-center">
          WHO ARE WE?
        </h2>
        <h2 className="text-6xl font-bold mb-4 text-center">
          ABOUT MOTELLEASE TECH
        </h2>
        <hr className=" border-black mx-auto w-1/4 my-8" />

        <div className="flex flex-col lg:flex-row gap-6 mx-auto p-4">
          <div className="bg-white p-8 rounded-lg shadow-md flex-1">
            <div className="flex items-center justify-center mb-4">
              <TeamOutlined className="text-blue-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
              Meet Our Team
            </h2>
            <p className="text-gray-700 mt-4">
              <strong>Members and Roles:</strong>
            </p>
            <ul className="list-disc ml-5 mt-2 text-gray-700 space-y-2">
              <li>Doan Thanh Phuc - Team Leader</li>
              <li>Nguyen Truong Duy - Backend Developer</li>
              <li>Tran Gia Vy - Backend Developer</li>
              <li>Duong My Tien - website Developer</li>
              <li>To Do Hong Y - website Developer</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Our Goal:</strong> To create a platform that connects
              tenants and landlords efficiently, using modern technology.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md flex-1">
            <div className="flex items-center justify-center mb-4">
              <AimOutlined className="text-blue-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
              Why This Project & Goals
            </h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>
                <strong>Why This Project?</strong> Addressing real-world
                problems: Difficulty in finding and managing rental properties,
                leveraging technology to optimize the rental process for both
                tenants and landlords, and aligning with market trends and the
                growing demand for digital platforms.
              </li>
              <li>
                <strong>Project Goals:</strong> Build a platform that connects
                landlords and tenants easily, provide features like online
                booking, electronic payments, and contract management, and
                enhance the rental experience by utilizing modern technologies.
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md flex-1">
            <div className="flex items-center justify-center mb-4">
              <CodeOutlined className="text-blue-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
              Technologies & Future Vision
            </h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              <li>
                <strong>Technologies Used:</strong> ReactJS, Node.js, MongoDB,
                integration with electronic payment systems (Momo, VNPay), and
                modern deployment and security tools (CI/CD, Cloud Hosting).
              </li>
              <li>
                <strong>Vision & Future Development:</strong> Adding features
                like user reviews and feedback, expanding the platform to cover
                more regions, and enhancing user experience with AI-powered
                rental recommendations.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
