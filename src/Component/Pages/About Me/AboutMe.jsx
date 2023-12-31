import React from "react";
import "../About Me/AboutMe.css";
const AboutMe = () => {
  return (
    <div className="py-24" id="aboutMe">
      <div>
        <h2 className="text-center text-3xl md:text-5xl lg:text-5xl font-semibold p-2 md:p-6 lg:p-12">
          <span className="text-4xl md:text-6xl lg:text-6xl text-amber-400">
            "
          </span>
          About Me
          <span className="text-4xl md:text-6xl lg:text-6xl text-amber-400">
            "
          </span>
        </h2>
        <p className="text-sm md:text-lg lg:text-xl py-1 md:py-5 lg:py-12 ">
          I am a{" "}
          <span className="text-amber-400 bg-black px-0 md:px-1 lg:px-1">
            19 year old Junior Web developer
          </span>{" "}
          , who is passionate about creating user-friendly websites and
          enhancing user experiences. I also have a passion for learning to stay
          ahead in the field of web development.
        </p>
      </div>
      <div className="p-4 flex justify-start items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <div className="relative w-4 h-4 animate-blink m-2 hidden md:block lg:block ">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full animate-glow bg-yellow-400 ring-4 ring-amber-400 animate-blink-ring"></div>
              </div>
            </div>
            <div>
              <span className="text-amber-400 whitespace-nowrap text-sm md:text-base lg:text-xl pr-1 hidden md:block lg:block ">
                ------
              </span>
            </div>
            <div>
              <p className="text-xs md:text-xl lg:text-2xl">
                <span className="text-amber-400 text-3xl inline-block md:hidden lg:hidden pr-2">
                  .
                </span>
                I am <span className="bg-amber-400">Mern</span> Developer.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative w-4 h-4 animate-blink m-2 hidden md:block lg:block ">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full animate-glow bg-yellow-400 ring-4 ring-amber-400 animate-blink-ring"></div>
              </div>
            </div>
            <div>
              <span className="text-amber-400 whitespace-nowrap text-sm md:text-base lg:text-xl pr-1 hidden md:block lg:block">
                ------
              </span>
            </div>
            <div>
              <p className="text-xs md:text-xl lg:text-2xl">
                <span className="text-amber-400 text-3xl inline-block md:hidden lg:hidden pr-2">
                  .
                </span>
                usually{" "}
                <span className="bg-amber-400">
                  Feels Comfortable In Front-End
                </span>
                , But there is always a room for improvement.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative w-4 h-4 animate-blink m-2 hidden md:block lg:block ">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full animate-glow bg-yellow-400 ring-4 ring-amber-400 animate-blink-ring"></div>
              </div>
            </div>
            <div>
              <span className="text-amber-400 whitespace-nowrap text-sm md:text-base lg:text-xl pr-1 hidden md:block lg:block">
                ------
              </span>
            </div>
            <div>
              <p className="text-xs md:text-xl lg:text-2xl">
                <span className="text-amber-400 text-3xl inline-block md:hidden lg:hidden pr-2">
                  .
                </span>
                I have hands-on experience with{" "}
                <span className="bg-amber-400">
                  MongoDB, Express.js, React, and Node.js
                </span>
                .
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative w-4 h-4 animate-blink m-2 hidden md:block lg:block ">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full animate-glow bg-yellow-400 ring-4 ring-amber-400 animate-blink-ring"></div>
              </div>
            </div>
            <div>
              <span className="text-amber-400 whitespace-nowrap text-sm md:text-base lg:text-xl pr-1 hidden md:block lg:block">
                ------
              </span>
            </div>
            <div>
              <p className="text-xs md:text-xl lg:text-2xl">
                <span className="text-amber-400 text-3xl inline-block md:hidden lg:hidden pr-2">
                  .
                </span>
                utilize{" "}
                <span className="bg-amber-400">
                  modern web development technologies
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
