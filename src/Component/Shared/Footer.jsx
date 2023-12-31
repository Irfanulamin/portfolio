import React from "react";
import { BsGithub } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <div>
      <footer className="footer text-base-content p-4 md:p-20 lg:p-32 bg-black">
        <div>
          <img
            src="/profile_logo.png"
            className="h-16 w-16 border-2 border-black rounded-full"
          />
          <p className="font-semibold text-base text-white">
            Irfanul Amin
            <br />
            <span className="text-xs text-white">Junior Web Developer</span>
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm md:text-xl lg:text-xl">
            Contact Information
          </h4>
          <p className="text-white font-semibold">irfanulamin07@gmail.com</p>
          <p className="text-white font-semibold">+880 1827563064</p>
          <div className="flex items-center gap-2">
            <a
              href="https://www.linkedin.com/in/irfanul-amin-218b37278/"
              target="blank"
            >
              <FaLinkedin className="w-7 h-7"></FaLinkedin>
            </a>
            <a href="https://github.com/Irfanulamin" target="blank">
              <BsGithub className="w-7 h-7 "></BsGithub>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
