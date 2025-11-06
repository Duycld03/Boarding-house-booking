import React from "react";
import { TeamOutlined, AimOutlined, CodeOutlined } from "@ant-design/icons";
import { useTheme } from "../../../context/themeContext"; // Assuming themeContext is set up
import { useTranslation } from "react-i18next"; // Assuming i18n is configured

function AboutUs() {
  const { darkMode } = useTheme();
  const { t } = useTranslation("aboutUs");

  return (
    <div
      className={`min-h-screen py-10 px-5 ${darkMode ? "bg-background-dark text-text-dark" : "bg-[#f0f2f5] text-gray-800"
        }`}
    >
      {/* Header Section */}
      <header
        className="text-center mb-12 bg-cover bg-center bg-no-repeat py-20 px-4"
        style={{
          backgroundImage: `url('https://afamilycdn.com/150157425591193600/2022/9/30/hinh-anh-cac-sinh-vien-kien-truc-cung-nhau-lam-viec-nhom-16642466416561577942506-1664469958516-16644699587351209650787-1664506667990-1664506668496235501908.jpg')`,
        }}
      >
        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold text-white">
          {t("header.title")}
        </h1>
        <p className="text-white mt-8 max-w-xl mx-auto text-base sm:text-lg lg:text-xl">
          {t("header.subtitle")}
        </p>
      </header>

      {/* About Us Section */}
      <div>
        <h2 className="text-4xl font-bold text-blue-600 mb-4 text-center">
          {t("aboutUs.title")}
        </h2>
        <h2 className="text-6xl font-bold mb-4 text-center">
          {t("aboutUs.subtitle")}
        </h2>
        <hr className="border-black mx-auto w-1/4 my-8" />

        {/* Cards Section */}
        <div className="flex flex-col lg:flex-row gap-6 mx-auto p-4">
          {/* Meet Our Team Card */}
          <div
            className={`p-8 rounded-lg shadow-md flex-1 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
          >
            <div className="flex items-center justify-center mb-4">
              <TeamOutlined className="text-blue-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
              {t("cards.team.title")}
            </h2>
            <p className="mt-4">
              <strong>{t("cards.team.membersTitle")}</strong>
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-2">
              <li>{t("cards.team.members.0")}</li>
              <li>{t("cards.team.members.1")}</li>
              <li>{t("cards.team.members.2")}</li>
              <li>{t("cards.team.members.3")}</li>
              <li>{t("cards.team.members.4")}</li>
            </ul>
            <p className="mt-4">
              <strong>{t("cards.team.goalTitle")}</strong>{" "}
              {t("cards.team.goal")}
            </p>
          </div>

          {/* Why This Project & Goals Card */}
          <div
            className={`p-8 rounded-lg shadow-md flex-1 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
          >
            <div className="flex items-center justify-center mb-4">
              <AimOutlined className="text-blue-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
              {t("cards.project.title")}
            </h2>
            <ul className="list-disc ml-5 space-y-2">
              <li>
                <strong>{t("cards.project.whyTitle")}</strong>{" "}
                {t("cards.project.why")}
              </li>
              <li>
                <strong>{t("cards.project.goalsTitle")}</strong>{" "}
                {t("cards.project.goals")}
              </li>
            </ul>
          </div>

          {/* Technologies & Future Vision Card */}
          <div
            className={`p-8 rounded-lg shadow-md flex-1 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
          >
            <div className="flex items-center justify-center mb-4">
              <CodeOutlined className="text-blue-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
              {t("cards.technologies.title")}
            </h2>
            <ul className="list-disc ml-5 space-y-2">
              <li>
                <strong>{t("cards.technologies.usedTitle")}</strong>{" "}
                {t("cards.technologies.used")}
              </li>
              <li>
                <strong>{t("cards.technologies.futureTitle")}</strong>{" "}
                {t("cards.technologies.future")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;