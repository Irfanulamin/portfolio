import React, { useState } from "react";
import { Bars3Icon, ArrowsPointingInIcon } from "@heroicons/react/24/solid";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="flex flex-row justify-between items-center py-5 md:py-10 lg:py-10">
      <div>
        <h2 className="text-xl md:text-4xl lg:text-4xl font-extrabold">
          Irfanul Am<span className="text-amber-400">in</span>
        </h2>
      </div>
      <div className="md:hidden lg:hidden">
        <button
          onClick={toggleNavbar}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-600 focus:outline-none focus:text-gray-600"
        >
          {isOpen ? (
            <ArrowsPointingInIcon className="w-6 h-6 text-black"></ArrowsPointingInIcon>
          ) : (
            <Bars3Icon className="w-6 h-6 text-black"></Bars3Icon>
          )}
        </button>
      </div>
      <div
        className={`md:flex lg:flex hidden justify-center items-center ${
          isOpen ? "flex" : "hidden"
        }`}
      >
        <ul className="flex flex-col md:flex-row lg:flex-row gap-3 justify-center items-center gap-x-7">
          <li>
            <a
              href="#aboutMe"
              className="font-semibold px-2 text-sm lg:text-base"
            >
              About me
            </a>
          </li>
          <li>
            <a
              href="#myProjects"
              className="font-semibold px-2 text-sm lg:text-base"
            >
              My Projects
            </a>
          </li>
          <li>
            <a
              href="#contactMe"
              className="font-semibold px-2 text-sm lg:text-base"
            >
              Contact Me
            </a>
          </li>
        </ul>
      </div>
      {isOpen && (
        <div className="md:hidden lg:hidden absolute top-14 right-4 bg-white shadow-md rounded-md border-black/80 border-2 p-2 w-44">
          <ul>
            <li>
              <a href="#aboutMe" className="block py-2">
                <span className="text-sm font-semibold">About me</span>
              </a>
              <hr />
            </li>
            <li>
              <a href="#myProjects" className="block py-2">
                <span className="text-sm font-semibold">My Projects</span>
              </a>
              <hr />
            </li>
            <li>
              <a href="#contactMe" className="block py-2">
                <span className="text-sm font-semibold">Contact Me</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
