import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import contactImage from "../../../assets/images/contact.png";
import laptopImage from "../../../assets/images/laptop.png";
import phoneImage from "../../../assets/images/phone.png";
import { MdAttachEmail } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const form = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_xeyv5cm",
        "template_fr80l6u",
        form.current,
        "Z-UDdO5-KDMC3oHM7"
      )
      .then(
        (result) => {
          if (result.text === "OK") {
            toast.success("Message Sent !", {
              position: "top-right",
              autoClose: 1500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <div
      className="w-100% py-16 md:py-36 lg:py-36 px-4 md:px-20 lg:px-20 bg-base-200/25 mt-12"
      id="contactMe"
    >
      <div className="py-2 md:py-8 lg:py-12">
        <div className="flex justify-center items-center gap-1">
          <div>
            <h2 className="text-center text-xl md:text-5xl lg:text-5xl font-semibold">
              Contact Me
            </h2>
          </div>
          <div>
            <MdAttachEmail className="text-2xl md:text-5xl lg:text-5xl text-amber-400"></MdAttachEmail>
          </div>
        </div>
        <h2 className="text-center text-lg font-semibold py-2 text-black">
          <span className="text-amber-400 text-3xl">"</span>Why are you waiting
          for ?<span className="text-amber-400 text-3xl">"</span>
        </h2>
      </div>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="w-full md:w-1/2 lg::w-1/2 p-5">
          <div className="flex justify-center items-center">
            <div>
              <img
                src={contactImage}
                alt="contact-image"
                className="-rotate-12 hover:-rotate-45 custom_transition2 "
              />
              <img
                src={laptopImage}
                alt="contact-image"
                className="hover:-rotate-12 -rotate-45 custom_transition2"
              />
            </div>
            <div>
              <img
                src={phoneImage}
                alt="contact-image"
                className="hover:-rotate-12 rotate-45 custom_transition2"
              />
            </div>
          </div>
        </div>
        <div className="w-full bg-base-100 border-2 border-black rounded p-8 p lg:w-7/12">
          <form ref={form} onSubmit={handleSubmit}>
            <div className="py-2">
              <label className="text-sm md:text-lg lg:text-lg font-semibold ">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                className="mt-1 w-full p-2 text-black border border-gray-400 rounded resize-none focus:outline-none focus:border-black text-xs md:text-lg lg:text-lg"
              />
            </div>
            <div className="py-2">
              <label className="text-sm md:text-lg lg:text-lg font-semibold text-black ">
                E-mail
              </label>
              <input
                type="text"
                name="email"
                placeholder="Your email"
                className="mt-1 w-full p-2 text-black border border-gray-400 rounded resize-none focus:outline-none focus:border-black text-xs md:text-lg lg:text-lg"
              />
            </div>
            <label className="text-sm md:text-lg lg:text-lg font-semibold text-black ">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Your message"
              rows="4"
              className="mt-1 w-full p-2 text-black border border-gray-400 rounded resize-none focus:outline-none focus:border-black text-xs md:text-lg lg:text-lg"
              required
            ></textarea>
            <input
              type="submit"
              value="Send Email"
              className="w-full text-center py-2 bg-amber-400 rounded my-2 font-semibold tracking-wide hover:bg-black hover:text-amber-400 custom_transition"
            />
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Contact;
