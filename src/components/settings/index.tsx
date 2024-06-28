import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/api";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

import io from "socket.io-client";
import { MainContext } from "@/pages/_app";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const Settings = () => {
  const { config } = useContext(MainContext);
  const router = useRouter();
  const [currencyPair, setCurrencyPair] = useState<string>("SAFTP_USDT");
  const [lotSize, setLotSize] = useState<string>("0");
  const [tradeSide, setTradeSide] = useState<string>("");
  const [limit, setLimit] = useState<string>("0");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [intervalHours, setIntervalHours] = useState<number>(0);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(0);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(0);
  const [checkbox1, setCheckbox1] = useState<boolean>(false);
  const [checkbox2, setCheckbox2] = useState<boolean>(false);
  const [checkbox3, setCheckbox3] = useState<boolean>(false);
  const [existingTradeSchedules, setExistingTradeSchedules] = useState<
    TradeSchedule[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lotSizeError, setLotSizeError] = useState<string>("");
  const [isLoadingTradeSchedules, setIsLoadingTradeSchedules] =
    useState<boolean>(true);

  const [socket, setSocket] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await axios.get<{ tradeSchedules: TradeSchedule[] }>(
        `${BASE_URL}/tradeSchedulers?type=existing`,
        config
      );
      setExistingTradeSchedules(res.data.tradeSchedules);
      setIsLoadingTradeSchedules(false);
    } catch (error) {
      console.error("Error fetching trade schedules:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [config]);

  const handleCheckbox1Change = () => {
    setCheckbox1(!checkbox1);
  };

  const handleCheckbox2Change = () => {
    setCheckbox2(!checkbox2);
  };

  const handleCheckbox3Change = () => {
    setCheckbox3(!checkbox3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    setIsLoading(true);

    const interval = calculateIntervalTime();

    if (lotSizeError !== "") {
      setIsLoading(false);
      setError(error);
      return;
    }

    if (
      !currencyPair ||
      Number(lotSize) <= 0 ||
      !tradeSide ||
      Number(limit) <= 0 ||
      !startTime ||
      !(checkbox1 || checkbox2 || checkbox3) ||
      interval < 1000
    ) {
      setError("Please fill all the required fields.");
      setIsLoading(false);
      return;
    }

    const selectedExchanges: string[] = [];
    if (checkbox1) selectedExchanges.push("Azbit");
    if (checkbox2) selectedExchanges.push("Coinsbit");
    if (checkbox3) selectedExchanges.push("DexTrade");

    const data = {
      side: tradeSide,
      tradeQuantity: lotSize.toString(),
      startTime,
      interval,
      numberOfTrades: limit,
      exchanges: selectedExchanges,
    };

    try {
      const url = `${BASE_URL}/tradeSchedulers/new`;
      const res = await axios.post(url, data, config);

      toast.success("Trade Schedule is added successfully");

      setLotSize("0");
      setTradeSide("");
      setLimit("0");
      setStartTime(null);
      setIntervalHours(0);
      setIntervalMinutes(0);
      setIntervalSeconds(0);
      setCheckbox1(false);
      setCheckbox2(false);
      setCheckbox3(false);

      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  function calculateIntervalTime(): number {
    return (
      intervalHours * 60 * 60 * 1000 +
      intervalMinutes * 60 * 1000 +
      intervalSeconds * 1000
    );
  }

  useEffect(() => {
    if (checkbox3 && Number(lotSize) > 0 && Number(lotSize) < 10) {
      setLotSizeError(
        "Lot size must be 10 or greater when Dex-Trade is selected."
      );
    } else {
      setLotSizeError("");
    }
  }, [checkbox3, lotSize]);

  const updateStartTime = async (id: string) => {
    try {
      const data = {
        startTime: new Date(Date.now()),
      };
      const url = `${BASE_URL}/tradeScheduler/${id}`;
      const res = await axios.put(url, data, config);
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const stopTradeExecution = async (id: string) => {
    try {
      const data = {
        status: "Stopped",
      };
      const url = `${BASE_URL}/tradeScheduler/${id}`;
      const res = await axios.put(url, data, config);
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTradeScheduler = async (id: string) => {
    try {
      const url = `${BASE_URL}/tradeScheduler/${id}`;
      const res = await axios.delete(url, config);
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  function calculateRemainingTime(existingTradeSchedule: TradeSchedule) {
    const now = new Date();
    const startTime = new Date(existingTradeSchedule.startTime);
    const difference = startTime.getTime() - now.getTime();

    if (difference < 1000) {
      return "0";
    } else {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let remainingTime = "";

      if (days > 0) {
        remainingTime += `${days} days `;
      }

      if (hours > 0) {
        remainingTime += `${hours} hrs `;
      }

      if (minutes > 0) {
        remainingTime += `${minutes} min `;
      }

      if (seconds > 0) {
        remainingTime += `${seconds} sec`;
      }

      return remainingTime.trim();
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateRemainingTime();
    }, 1000);
  }, []);

  const updateRemainingTime = () => {
    setExistingTradeSchedules((prevTradeSchedules) =>
      prevTradeSchedules.map((tradeSchedule) => ({
        ...tradeSchedule,
        remainingTime: calculateRemainingTime(tradeSchedule),
      }))
    );
  };

  const handleEditClick = (id: string) => {
    router.push(`/settings/edit/${id}`);
  };

  // ------------------------------- websocket integration

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Handle connection
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("tradeSchedulesData", (data) => {
      console.log(data);
    });

    // Handle disconnection
    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      // Disconnect from Socket.IO server when component unmounts
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Listen for 'tradeUpdate' event from Socket.IO server
    if (socket) {
      socket.on("tradeScheduleUpdated", () => {
        fetchData();
      });
    }

    return () => {
      // Remove event listener when component unmounts
      if (socket) {
        socket.off("tradeScheduleUpdated");
      }
    };
  }, [socket]);

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

  const handleChangeStartTime = (date: Date | null) => {
    setStartTime(date);
  };

  return (
    <section className="py-[100px]">
      <div className="container mx-auto max-[1079px]:px-4">
        <div className="bg-[#fff] rounded-[5px] p-5 border-[#adb2b7] border-[1px] border-solid">
          <div className="grid md:grid-cols-2 grid-cols-1 items-start gap-4 lg:gap-[30px]">
            <div className="bg-[#fff] rounded-[5px] p-5 lg:p-[30px] border-[#adb2b7] border-[1px] border-solid">
              <form onSubmit={handleSubmit}>
                <div className="flex lg:items-center flex-col lg:flex-row  gap-2 my-4">
                  <p className="md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Exchanges:
                  </p>
                  <div className=" flex items-center gap-2">
                    <div className="">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={checkbox1}
                          onChange={handleCheckbox1Change}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-1 sm:text-base text-sm text-[#000] font-normal">
                          Azbit
                        </span>
                      </label>
                    </div>
                    <div className="">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={checkbox2}
                          onChange={handleCheckbox2Change}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-1 sm:text-base text-sm text-[#000] font-normal">
                          Coinsbit
                        </span>
                      </label>
                    </div>
                    <div className="">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={checkbox3}
                          onChange={handleCheckbox3Change}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-1 sm:text-base text-sm text-[#000] font-normal">
                          Dex-Trade
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex lg:items-center lg:flex-row flex-col  lg:gap-3 gap-1">
                  <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Currency Pair:
                  </label>
                  <input
                    type="text"
                    value={currencyPair}
                    readOnly
                    onChange={(e) => setCurrencyPair(e.target.value)}
                    className="border-[#adb2b7] border-[1px] text-lg text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[200px] w-full"
                  />
                </div>
                <div className="mb-4 lg:items-center lg:flex-row flex-col flex flex-row lg:gap-3 gap-1">
                  <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Lot Size:
                  </label>
                  <input
                    type="number"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    min="0"
                    className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[200px] w-full"
                    required
                  />
                </div>

                {lotSizeError && (
                  <p className="text-red-600 my-4">{lotSizeError}</p>
                )}

                <div className="mb-4 lg:items-center lg:flex-row flex-col  flex-row flex lg:gap-3 gap-1">
                  <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Trade Side:
                  </label>
                  <select
                    value={tradeSide}
                    onChange={(e) => setTradeSide(e.target.value)}
                    className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[100px] w-full"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
                <div className="mb-4 lg:items-center lg:flex-row flex-col flex-row flex  lg:gap-3 gap-1">
                  <label className="block md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Interval hours:
                  </label>
                  <select
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[100px] w-full"
                  >
                    <option value="">0 hr</option>
                    {[...Array(12)].map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1} hr
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4 lg:items-center lg:flex-row flex-col flex-row flex lg:gap-3 gap-1">
                  <label className="block md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Interval minutes:
                  </label>
                  <select
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="border-[#adb2b7] border-[1px] text-lg text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[150px] w-full"
                  >
                    <option value="0">0 minutes</option>
                    {[...Array(59)].map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1} minutes
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4 lg:items-center lg:flex-row flex-col flex-row flex lg:gap-3 gap-1">
                  <label className="block md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Interval seconds:
                  </label>
                  <select
                    value={intervalSeconds}
                    onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                    className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[150px] w-full"
                  >
                    <option value="0">0 seconds</option>
                    {[...Array(59)].map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1} seconds
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4 flex  flex-col">
                  <div className="lg:items-center lg:flex-row flex-col flex-row flex lg:gap-3 gap-1">
                    <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
                      Trade Limit:
                    </label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      min="0"
                      className="border-[#adb2b7] border-[1px] text-lg text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[200px] w-full"
                      required
                    />
                  </div>
                  <label className="block  text-sm text-[#000] font-normal">
                    Maximum number of trades to execute
                  </label>
                </div>
                <div className="mb-4 lg:items-center lg:flex-row flex-col flex-row flex lg:gap-3 gap-1">
                  <label className="block md:text-lg sm:text-base text-sm text-[#000] font-normal">
                    Start After:
                  </label>

                  <DatePicker
                    selected={startTime}
                    onChange={handleChangeStartTime}
                    showTimeSelect
                    dateFormat="yyyy-MM-dd HH:mm:ss"
                    minDate={new Date()}
                    minTime={new Date()}
                    maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                    timeIntervals={1}
                    placeholderText="Select Date and Time"
                    className="border-[#adb2b7] border-[1px] text-lg text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[190px] w-full"
                  />
                </div>

                {error && <p className="text-red-600 my-4">{error}</p>}

                <div className="my-5 md:justify-start justify-center flex">
                  <button
                    className={`relative bg-[#1470FF]  max-[350px]:text-base text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2 mt-4`}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          aria-hidden="true"
                          className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    )}
                    <span className={isLoading ? "opacity-0" : ""}>
                      Save Schedule
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#fff] rounded-[5px] p-[30px] border-[#adb2b7] border-[1px] border-solid">
              {/* <p className="text-lg text-[#000] font-normal">Exchanges:</p> */}
              <p className="text-lg text-[#000] font-normal my-4">
                Trade_side: {tradeSide}
              </p>
              <p className="text-lg text-[#000] font-normal my-4">
                Interval_hours: {intervalHours}
              </p>
              <p className="text-lg text-[#000] font-normal">
                Interval_minutes: {intervalMinutes}
              </p>
              <p className="text-lg text-[#000] font-normal mt-4">
                Interval_seconds: {intervalSeconds}
              </p>
              <p className="text-lg text-[#000] font-normal mt-4">
                Trade Limit: {limit}
              </p>
            </div>
          </div>

          <div className="bg-[#fff] rounded-[5px] p-[30px] border-[#adb2b7] border-[1px] border-solid my-5">
            <p className="sm:text-2xl text-lg text-[#000] font-bold">
              Existing Trade Schedules
            </p>
            <div className="border-b-[1px] border-solid border-[#adb2b7] mt-5"></div>

            {isLoadingTradeSchedules ? (
              <p className="my-4 text-[#000] text-3xl text-center">
                Loading...
              </p>
            ) : existingTradeSchedules.length === 0 ? (
              <p className="my-4 text-[#000]">
                There is no existing trade schedule
              </p>
            ) : (
              <div className="w-full overflow-auto no-scrollbar">
                <table className="w-full relative">
                  <thead>
                    <tr className="text-sm xl:text-base font-semibold text-[#000] border-b-[1px] border-solid border-[#adb2b7]">
                      <th className="text-left font-semibold pl-5 max-[1380px]:min-w-[12rem] py-3">
                        Currency Pair
                      </th>
                      <th className="text-left font-semibold max-[1380px]:min-w-[12rem] px-5 py-3">
                        Lot Size
                      </th>
                      <th className="text-left font-semibold px-5 max-[1380px]:min-w-[12rem] py-3">
                        Interval
                      </th>
                      <th className="text-left font-semibold px-5 max-[1380px]:min-w-[12rem] py-3">
                        Trade Side
                      </th>
                      <th className="text-left font-semibold px-5 max-[1380px]:min-w-[12rem] py-3">
                        Limit
                      </th>
                      <th className="font-semibold pr-5 text-left max-[1380px]:min-w-[12rem] py-3">
                        Remaining Time
                      </th>
                      <th className="font-semibold pr-5 text-left max-[1380px]:min-w-[12rem] py-3">
                        Status
                      </th>
                      <th className="font-semibold pr-5 text-right max-[1380px]:min-w-[12rem] py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="my-4">
                    {existingTradeSchedules.map(
                      (existingTradeSchedule: any, index: number) => (
                        <tr
                          key={index}
                          className="text-sm xl:text-base font-medium w-full border-b-[1px] border-solid border-[#adb2b7] cursor-pointer text-[#303030]"
                        >
                          <td className="text-left pl-5 font-medium max-[1380px]:min-w-[12rem] py-2 relative">
                            SAFTP_USDT
                          </td>
                          <td className="text-left px-5 max-[1380px]:min-w-[12rem] font-medium py-2">
                            {existingTradeSchedule.tradeQuantity}
                          </td>
                          <td className="text-left px-5 max-[1380px]:min-w-[12rem] font-medium py-2">
                            {renderInterval(existingTradeSchedule.interval)}
                          </td>
                          <td className="text-left px-5 max-[1380px]:min-w-[12rem] font-medium py-2">
                            {existingTradeSchedule.side}
                          </td>
                          <td className="text-left px-5 max-[1380px]:min-w-[12rem] font-medium py-2">
                            {existingTradeSchedule.numberOfTrades}
                          </td>
                          <td className="text-left pr-5 max-[1380px]:min-w-[12rem] py-2 font-medium ">
                            {existingTradeSchedule.remainingTime}
                          </td>
                          <td className="text-left pr-5 max-[1380px]:min-w-[12rem] py-2 font-medium">
                            {existingTradeSchedule.status}
                          </td>
                          <td className="text-right pr-5 max-[1380px]:min-w-[12rem] py-2 font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {existingTradeSchedule.status !== "Started" && (
                                <>
                                  <button
                                    className="bg-[#616770] text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2"
                                    onClick={() => {
                                      handleEditClick(
                                        existingTradeSchedule._id
                                      );
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="bg-[#ff0000] text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2"
                                    onClick={() =>
                                      deleteTradeScheduler(
                                        existingTradeSchedule._id
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              <button
                                className="bg-[#008000] text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2"
                                onClick={() =>
                                  updateStartTime(existingTradeSchedule._id)
                                }
                              >
                                Start
                              </button>
                              <button
                                className="bg-[#ffbf00] text-lg font-normal text-[#000] flex justify-center items-center rounded-[5px] px-4 py-2"
                                onClick={() =>
                                  stopTradeExecution(existingTradeSchedule._id)
                                }
                              >
                                Stop
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
