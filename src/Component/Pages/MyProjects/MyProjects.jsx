import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BsBoxArrowUpRight, BsEyeFill } from "react-icons/bs";
import vocalStudio from "../../../assets/project_images/vocal-studio.png";
import cloudPalace from "../../../assets/project_images/cloud-palace.png";
import alSultan from "../../../assets/project_images/al-sultans.png";
import linkedOut from "../../../assets/project_images/linkedOut.png";

const MyProjects = () => {
  const [aosInitialized, setAOSInitialized] = useState(false);

  useEffect(() => {
    const delay = 1000; // Delay in milliseconds

    const timer = setTimeout(() => {
      if (!aosInitialized) {
        AOS.init();
        setAOSInitialized(true);
      }
    }, delay);

    return () => clearTimeout(timer); // Clear the timeout if the component unmounts
  }, [aosInitialized]);

  return (
    <div
      className="w-full flex justify-center items-center p-2  lg:p-24"
      id="myProjects"
    >
      <div className="flex flex-col justify-center items-center gap-6 md:gap-12 lg:gap-16">
        <h2 className="text-center text-3xl md:text-5xl lg:text-5xl font-semibold py-12">
          <span className="text-4xl md:text-6xl lg:text-6xl text-amber-400">
            "
          </span>
          My Projects
          <span className="text-4xl md:text-6xl lg:text-6xl text-amber-400">
            "
          </span>
        </h2>
        <div className="flex justify-center items-start lg:items-center  gap-2 flex-col lg:flex-row">
          <div data-aos="flip-left">
            <img
              loading="lazy"
              src={vocalStudio}
              alt=""
              className="border md:w-[30rem] md:h-[21.5rem]  border-black w-[16rem] h-[9.5rem] lg:w-[36rem] lg:h-[20rem] blur-0 hover:blur-sm object-cover object-top hover:object-bottom custom_transition2"
            />
          </div>
          <div data-aos="fade-up" className="p-4 w-100% lg:w-1/2">
            <h2 className="text-3xl font-bold text-black">Vocal Studio</h2>
            <p className="text-sm font-semibold py-2 ">
              Vocal Studio is a
              <span className="text-amber-400"> MERN stack website</span> that
              serves as a platform for learning musical instruments. The website
              features three different dashboards: instructor, student, and
              admin.
            </p>
            <ul>
              <li>
                <p>
                  <span className="text-amber-400 text-3xl">. </span>
                  <span className="text-base font-medium">
                    MERN Stack Website
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-400 text-3xl">. </span>
                  <span className="text-base font-medium">
                    3 Dashboards: Admin, Instructor, Student
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-400 text-3xl">. </span>
                  <span className="text-base font-medium">Friendly UI/UX</span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-400 text-3xl">. </span>
                  <span className="text-base font-medium">JWT Token</span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-400 text-3xl">. </span>
                  <span className="text-base font-medium">
                    Firebase Authentication
                  </span>
                </p>
              </li>
            </ul>
            <div className="flex gap-2 py-2">
              <a
                href="https://vocal-studio-auth.web.app/"
                target="blank"
                className="bg-black text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition hover:text-black hover:bg-white border hover:border-black flex items-center gap-1.5"
              >
                View <BsEyeFill></BsEyeFill>
              </a>
              <a
                href="https://github.com/Irfanulamin/Vocal-Client-Side"
                target="blank"
                className="hover:bg-black hover:text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition text-black bg-white border border-black flex items-center gap-1.5"
              >
                Project <BsBoxArrowUpRight></BsBoxArrowUpRight>
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-start lg:items-center  gap-2 flex-col-reverse lg:flex-row">
          <div
            data-aos="fade-up"
            className="p-4 w-100% lg:w-1/2 text-left lg:text-right"
          >
            <h2 className="text-3xl font-bold text-cyan-400">
              Cloud <span className="text-amber-400">Palace</span>
            </h2>
            <p className="text-sm font-semibold py-2">
              An <span className="text-cyan-400">e-commerce website </span>
              offering a wide range of high-quality soft toys for sale providing
              a delightful shopping experience for toy enthusiasts of all ages.
            </p>
            <ul>
              <li>
                <p>
                  <span className="text-cyan-400 text-3xl">.</span>
                  <span className="text-base font-medium"> Admin Panel</span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-cyan-400 text-3xl">.</span>
                  <span className="text-base font-medium">
                    Can also add Toys and also can be view toy details.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-cyan-400 text-3xl">.</span>
                  <span className="text-base font-medium">
                    {" "}
                    Firebase Authentication
                  </span>
                </p>
              </li>
            </ul>
            <div className="flex gap-2 py-2 justify-normal lg:justify-end">
              <a
                href="https://cloud-palace-auth.web.app/"
                target="blank"
                className="bg-cyan-400 text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition hover:text-cyan-400 hover:bg-white border hover:border-cyan-400 flex items-center gap-1.5"
              >
                View <BsEyeFill></BsEyeFill>
              </a>
              <a
                href="https://github.com/Irfanulamin/cloud-palace"
                target="blank"
                className="hover:bg-cyan-400 hover:text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition text-cyan-400 bg-white border border-cyan-400 flex items-center gap-1.5"
              >
                Project <BsBoxArrowUpRight></BsBoxArrowUpRight>
              </a>
            </div>
          </div>
          <div data-aos="flip-right">
            <img
              loading="lazy"
              src={cloudPalace}
              className="md:w-[30rem] md:h-[21.5rem]  border border-black w-[16rem] h-[9.5rem] lg:w-[36rem] lg:h-[20rem] blur-0 hover:blur-sm object-cover object-top hover:object-bottom custom_transition2"
            />
          </div>
        </div>
        <div className="flex justify-center items-start lg:items-center  gap-2  flex-col lg:flex-row">
          <div data-aos="flip-left">
            <img
              loading="lazy"
              src={alSultan}
              className="w-[16rem] h-[9.5rem] md:w-[30rem] md:h-[21.5rem] lg:w-[36rem] lg:h-[20rem] blur-0 hover:blur-sm object-cover object-top hover:object-bottom custom_transition2  border border-black"
            />
          </div>
          <div data-aos="fade-up" className="p-4 w-100% lg:w-1/2">
            <h2 className="text-3xl font-bold text-slate-800">
              <span>AL</span>
              <span className="text-amber-600"> Sultans</span>
            </h2>
            <p className="text-sm font-semibold py-2">
              An <span className="text-amber-600">Eastern Food Chef’s </span>
              Recipe website, where most popular eastern chef’s post their
              famous recipes on this website. There is also a premium
              subscription to see the latest exclusive recipes of chefs.
            </p>
            <ul className="py-2">
              <li>
                <p>
                  <span className="text-amber-600 text-3xl">.</span>
                  <span className="text-base font-medium"> Add to Cart</span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-600 text-3xl">.</span>
                  <span className="text-base font-medium">
                    {" "}
                    Firebase Authentication
                  </span>
                </p>
              </li>
            </ul>
            <div className="flex gap-2 py-2">
              <a
                href="https://al-sultans-auth.web.app/"
                target="blank"
                className="bg-amber-600 text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition hover:text-amber-600 hover:bg-white border hover:border-amber-600 flex items-center gap-1.5"
              >
                View <BsEyeFill></BsEyeFill>
              </a>
              <a
                href="https://github.com/Irfanulamin/Al-Sultan-Client"
                target="blank"
                className="hover:bg-amber-600 hover:text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition text-amber-600 bg-white border border-amber-600 flex items-center gap-1.5"
              >
                Project <BsBoxArrowUpRight></BsBoxArrowUpRight>
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-start lg:items-centergap-2 flex-col-reverse lg:flex-row">
          <div
            data-aos="fade-up"
            className="p-4 w-100% lg:w-1/2 text-left  lg:text-right"
          >
            <h2 className="text-3xl font-bold text-amber-600">
              Linked<span className="text-black">Out</span>
            </h2>
            <p className="text-sm font-semibold py-2">
              An <span className="text-amber-600">Front end website </span>
              where you can apply for jobs (remote/on-site) with more than 1000+
              jobs also with vast range of categories.
            </p>
            <ul className="py-2">
              <li>
                <p>
                  <span className="text-amber-600 text-3xl">.</span>
                  <span className="text-base font-medium"> Fetch Api</span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-600 text-3xl">.</span>
                  <span className="text-base font-medium">
                    {" "}
                    Data Saved On Local Storage
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-amber-600 text-3xl">.</span>
                  <span className="text-base font-medium">
                    {" "}
                    Responsive Design
                  </span>
                </p>
              </li>
            </ul>
            <div className="flex gap-2 py-2 justify-normal lg:justify-end">
              <a
                href="https://fantastic-crumble-67462b.netlify.app/"
                target="blank"
                className="bg-amber-600 text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition hover:text-amber-600 hover:bg-white border hover:border-amber-600 flex items-center gap-1.5"
              >
                View <BsEyeFill></BsEyeFill>
              </a>
              <a
                href="https://fantastic-crumble-67462b.netlify.app/"
                className="hover:bg-amber-600 hover:text-white py-1 lg:py-2 px-4 lg:px-12 font-semibold custom_transition text-amber-600 bg-white border border-amber-600 flex items-center gap-1.5"
              >
                Project <BsBoxArrowUpRight></BsBoxArrowUpRight>
              </a>
            </div>
          </div>
          <div data-aos="flip-right">
            <img
              loading="lazy"
              src={linkedOut}
              className="w-[16rem] h-[9.5rem] md:w-[30rem] md:h-[21.5rem] lg:w-[36rem] lg:h-[20rem] blur-0 hover:blur-sm object-cover object-top hover:object-bottom custom_transition2 border border-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
