import { HiOutlineFolderDownload } from "react-icons/hi";
import { MdCall } from "react-icons/md";
import { Link } from "react-router-dom";
import Expertise from "./Expertise";
import { motion } from "framer-motion";

const Banner = () => {
  return (
    <div className="">
      <div className="flex justify-between flex-col-reverse md:flex-row lg:flex-row gap-x-12 items-centerpy-12 pt-8 md:pt-32 lg:pt-32">
        <div>
          <h1 className="text-base md:text-5xl lg:text-5xl font-bold">
            Hey,
            <br /> I am your
            <span className="text-amber-400"> Junior Web Developer</span>.
          </h1>
          <p className="text-xs md:text-lg lg:text-normal text-stone-700 font-medium py-1 md:py-5 lg:py-5">
            A friendly front-end developer who enjoys creating attractive and
            user-friendly interfaces. <br /> With a passion for blending design
            and technology, <br /> I am dedicated to delivering smooth and
            enjoyable digital experiences that leave a positive impact.
          </p>

          <div className="flex items-center py-2">
            <div className="inline-block mr-4">
              <Link
                to="#contactMe"
                className="flex justify-center items-center gap-1 text-white bg-black px-2 py-1 border hover:border-black hover:bg-transparent hover:text-black font-semibold custom_transition "
              >
                Contact
                <MdCall className="w-5 h-5"></MdCall>
              </Link>
            </div>
            <div className="inline-block">
              <Link
                to="https://drive.google.com/u/0/uc?id=1PqC6JjcPdIc4lpr4bkkIb6aYhToWNLtT&export=download"
                download
                className="flex justify-center items-center gap-1 text-black px-2 py-1 border border-black hover:bg-black hover:text-white font-semibold custom_transition"
              >
                Resume
                <HiOutlineFolderDownload className="w-5 h-5"></HiOutlineFolderDownload>
              </Link>
            </div>
          </div>
        </div>
        <div className=" border-black">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ rotate: -360, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 40,
            }}
          >
            <img
              src="/profile_logo.png"
              alt="logo"
              className="max-w-xs max-h-52 w-auto h-auto border-4 border-black "
            />
          </motion.div>
        </div>
      </div>
      <Expertise></Expertise>
    </div>
  );
};

export default Banner;
