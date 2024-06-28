import Sites from "@/components/site";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ConfigType = {
  headers: {
    "Content-Type": string;
    Authorization: string;
  };
};
type MainContextType = {
  token: string | null;
  config: ConfigType;
  setTokenFunc: (token: string) => void;
  deleteTokenFunc: () => void;
};

export const MainContext = createContext<MainContextType>({
  token: null,
  config: { headers: { "Content-Type": "", Authorization: "" } },
  setTokenFunc: () => {},
  deleteTokenFunc: () => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathName = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigType>({
    headers: {
      "Content-Type": "",
      Authorization: "",
    },
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setConfig({
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });
    }

    if (!storedToken && pathName !== "/login") {
      router.push("/login");
    }
  }, [pathName, token]);

  const setTokenFunc = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setConfig({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      },
    });
  };

  const deleteTokenFunc = () => {
    localStorage.removeItem("token");
    setToken(null);
    setConfig({
      headers: {
        "Content-Type": "",
        Authorization: "",
      },
    });
  };

  return (
    <>
      <MainContext.Provider
        value={{ token, config, setTokenFunc, deleteTokenFunc }}
      >
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>

        <Sites>
          <Component {...pageProps} />
          <ToastContainer
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Sites>
      </MainContext.Provider>
    </>
  );
}
