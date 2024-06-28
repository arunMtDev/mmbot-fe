import React, { useContext, useEffect } from "react";
import Header from "../header";
import { MainContext } from "@/pages/_app";

const Sites = ({ children }: any) => {
  const { token } = useContext(MainContext);
  return (
    <div className="">
      {token ? <Header /> : ""}
      {children}
    </div>
  );
};

export default Sites;
