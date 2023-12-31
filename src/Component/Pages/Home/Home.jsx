import React from "react";
import Banner from "./Banner";
import Expertise from "./Expertise";
import AboutMe from "../About Me/AboutMe";
import MyProjects from "../MyProjects/MyProjects";
import Contact from "../Contact/Contact";

const Home = () => {
  return (
    <div>
      <Banner></Banner>
      <AboutMe></AboutMe>
      <MyProjects></MyProjects>
      <Contact></Contact>
    </div>
  );
};

export default Home;
