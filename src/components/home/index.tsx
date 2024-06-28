import Link from "next/link";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "@/api";
import { MainContext } from "@/pages/_app";

interface TradeSchedule {
  _id: string;
  status: string;
  side: string;
  tradeQuantity: string;
  startTime: Date;
  interval: number;
  numberOfTrades: number;
  exchanges: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const Home = () => {
  const { config } = useContext(MainContext);
  const [tradeHistory, setTradeHistory] = useState<TradeSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<{ tradeSchedules: TradeSchedule[] }>(
          `${BASE_URL}/tradeSchedulers?type=history`,
          config
        );
        setTradeHistory(res.data.tradeSchedules);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trade schedules:", error);
      }
    };

    fetchData();
  }, [config]);

  const renderInterval = (interval: number) => {
    if (interval >= 3600000) {
      const hours = Math.floor(interval / 3600000);
      const minutes = Math.floor((interval % 3600000) / 60000);
      const seconds = Math.floor((interval % 60000) / 1000);
      return `${hours} hr ${minutes} min ${seconds} sec`;
    } else if (interval >= 60000) {
      const minutes = Math.floor(interval / 60000);
      const seconds = Math.floor((interval % 60000) / 1000);
      return `${minutes} min ${seconds} sec`;
    } else {
      const seconds = Math.floor(interval / 1000);
      return `${seconds} sec`;
    }
  };

  return (
    <section className="py-[100px]">
      <div className="container mx-auto">
        <div className="bg-[#fff] rounded-[5px] p-[30px] border-[#adb2b7] border-[1px] border-solid">
          <p className="text-2xl text-[#000] font-bold text-center">
            Trade Schedules History
          </p>
          <div className="border-b-[1px] border-solid border-[#adb2b7] mt-5"></div>

          {loading ? (
            <p className="my-4 text-[#000] text-3xl text-center">Loading...</p>
          ) : tradeHistory.length === 0 ? (
            <p className="my-4 text-[#000]">No history found</p>
          ) : (
            <div className="flex w-full overflow-auto no-scrollbar mb-5 ">
              <table className="w-full relative">
                <thead>
                  <tr className="text-sm  xl:text-base  font-semibold  text-[#000] border-b-[1px] border-solid border-[#adb2b7]">
                    <th className=" text-left font-semibold pl-5  max-[1380px]:min-w-[12rem]   py-3 ">
                      Currency Pair
                    </th>
                    <th className="  text-left font-semibold   max-[1380px]:min-w-[12rem]   px-5  py-3 ">
                      Lot Size
                    </th>
                    <th className=" text-left font-semibold px-5   max-[1380px]:min-w-[12rem]  py-3 ">
                      Interval
                    </th>
                    <th className=" text-left font-semibold px-5  max-[1380px]:min-w-[12rem]   py-3 ">
                      Trade Side
                    </th>
                    <th className=" text-left font-semibold px-5  max-[1380px]:min-w-[12rem]  py-3">
                      Limit
                    </th>
                    <th className=" text-left font-semibold px-5  max-[1380px]:min-w-[12rem]  py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="my-4">
                  {tradeHistory.map(
                    (tradeSchedule: TradeSchedule, index: number) => (
                      <tr
                        key={index}
                        className="text-sm  xl:text-base  font-medium  w-full border-b-[1px] border-solid border-[#adb2b7] cursor-pointer    text-[#303030]"
                      >
                        <td className="text-left pl-5 font-medium max-[1380px]:min-w-[12rem]   py-2  relative  ">
                          SAFTP_USDT
                        </td>

                        <td className="text-left px-5 max-[1380px]:min-w-[12rem]  font-medium py-2 ">
                          {tradeSchedule.tradeQuantity}
                        </td>
                        <td className="text-left px-5 max-[1380px]:min-w-[12rem]  font-medium py-2 ">
                          {renderInterval(tradeSchedule.interval)}
                        </td>

                        <td className="text-left px-5  max-[1380px]:min-w-[12rem]  font-medium py-2 ">
                          {tradeSchedule.side}
                        </td>
                        <td className="text-left px-5 max-[1380px]:min-w-[12rem]   font-medium py-2 ">
                          {tradeSchedule.numberOfTrades}
                        </td>
                        <td className="text-left px-5 max-[1380px]:min-w-[12rem]   font-medium py-2 ">
                          {tradeSchedule.status}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-center items-center">
            <Link href="/schedules/add">
              <button className="bg-[#1470FF] text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2 mt-4">
                Create New Schedules
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
