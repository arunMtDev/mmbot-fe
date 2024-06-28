import React, { useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { BASE_URL } from "@/api";
import { MainContext } from "../_app";

const Login: React.FC = () => {
  const { setTokenFunc } = useContext(MainContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/admin/login`, {
        email,
        password,
      });

      if (res.status === 200) {
        const data = res.data;
        setTokenFunc(data.token);
        router.push("/");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error occurred during login:", error);
    }
  };

  return (
    <section className=" ">
      <div className="container mx-auto max-[1079px]:px-4 flex items-center justify-center min-h-[100vh]">
        <form
          onSubmit={handleLogin}
          className="bg-[#fff] rounded-[5px] p-[30px] border-[#adb2b7] w-[30%] border-[1px] border-solid"
        >
          <div className="mb-4">
            <label className="block  text-lg text-[#000] font-normal mb-2">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[#adb2b7] border-[1px] text-lg text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block  text-lg text-[#000] font-normal mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#adb2b7] border-[1px] text-lg text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 w-full"
            />
          </div>
          <button
            className="bg-[#1470FF] max-[350px]:text-base text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2 mt-4"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
