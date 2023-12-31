import React from "react";
import htmlImage from "../../../assets/images/html-5.png";
import cssImage from "../../../assets/images/css-3.png";
import javascriptImage from "../../../assets/images/js.png";
import reactImage from "../../../assets/images/react.png";
import tailwindImage from "../../../assets/images/tailwind.png";
import mongoDBImage from "../../../assets/images/mongoDB.png";
import firebaseImage from "../../../assets/images/firebase.png";

const Expertise = () => {
  return (
    <div className="py-6 md:py-24 lg:py-24">
      <div className="flex flex-wrap justify-center items-center gap-7 md:gap-16 lg:gap-16 ">
        <div>
          <img
            loading="lazy"
            src={htmlImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain"
          />
        </div>
        <div>
          <img
            loading="lazy"
            src={cssImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain"
          />
        </div>
        <div>
          <img
            loading="lazy"
            src={javascriptImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain"
          />
        </div>
        <div>
          <img
            loading="lazy"
            src={reactImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain"
          />
        </div>
        <div>
          <img
            loading="lazy"
            src={tailwindImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain "
          />
        </div>
        <div>
          <img
            loading="lazy"
            src={mongoDBImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain "
          />
        </div>
        <div>
          <img
            loading="lazy"
            src={firebaseImage}
            className="h-8 md:h-16 lg:h-16 w-100% object-contain "
          />
        </div>
      </div>
    </div>
  );
};

export default Expertise;
