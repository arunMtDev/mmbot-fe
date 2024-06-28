import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/api";
import { toast } from "react-toastify";
import { MainContext } from "@/pages/_app";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Schedules = () => {
  const { config } = useContext(MainContext);

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lotSizeError, setLotSizeError] = useState<string>("");

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

      toast.success("Trade Schedule Created Successfully");
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

  const handleChangeStartTime = (date: Date | null) => {
    setStartTime(date);
  };
  return (
    <section className="py-[100px]">
      <div className="container mx-auto mx-auto max-[1079px]:px-4">
        <p className="text-2xl text-[#000] font-bold">Create Trade Schedules</p>
        <div className="flex lg:items-center flex-col lg:flex-row gap-2 mt-4">
          <p className="md:text-lg  sm:text-base text-sm text-[#000] font-normal">
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
                <span className="ml-2  sm:text-base text-sm text-[#000] font-normal">
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
                <span className="ml-2 sm:text-base text-sm text-[#000] font-normal">
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
                <span className="ml-2  sm:text-base text-sm text-[#000] font-normal">
                  Dex-Trade
                </span>
              </label>
            </div>
          </div>
        </div>
        <p className="text-sm text-[#000] font-normal mb-4">
          Select one or more exchanges to trade with.
        </p>
        <div className="">
          <div className="mb-4 flex lg:items-center lg:flex-row flex-col  lg:gap-3 gap-1">
            <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
              Currency Pair:
            </label>
            <input
              type="text"
              value={currencyPair}
              readOnly
              onChange={(e) => setCurrencyPair(e.target.value)}
              className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 w-full lg:w-[200px]"
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
              required
              className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 w-full lg:w-[200px]"
            />
          </div>

          {lotSizeError && <p className="text-red-600 my-4">{lotSizeError}</p>}

          <div className="mb-4 lg:items-center lg:flex-row flex-col flex flex-row lg:gap-3 gap-1">
            <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
              Trade Side:
            </label>
            <select
              value={tradeSide}
              onChange={(e) => setTradeSide(e.target.value)}
              className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 w-full lg:w-[100px]"
            >
              <option value="">Select</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div className="mb-4 flex  flex-col">
            <div className="lg:items-center lg:flex-row flex-col flex-row flex lg:gap-3 gap-1">
              <label className="block  md:text-lg sm:text-base text-sm text-[#000] font-normal">
                Limit:
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="0"
                className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[200px] w-full"
                required
              />
            </div>
            <label className="block  text-sm text-[#000] font-normal">
              Maximum number of trades to execute
            </label>
          </div>
          <div className="mb-4 flex  flex-col">
            <div className="lg:items-center lg:flex-row flex-col flex-row flex lg:gap-3 gap-1">
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
                className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[190px] w-full"
              />
            </div>
            <label className="block   sm:text-base text-sm text-[#000] font-normal">
              Starts After this durtion.
            </label>
          </div>
          <div className="mb-4 lg:items-center lg:flex-row flex-col flex-row flex  lg:gap-3 gap-1">
            <label className="block md:text-lg  sm:text-base text-sm text-[#000] font-normal">
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
            <label className="block md:text-lg  sm:text-base text-sm text-[#000] font-normal">
              Interval minutes:
            </label>
            <select
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              className="border-[#adb2b7] border-[1px] md:text-lg text-base text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 lg:w-[150px] w-full"
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
            <label className="block md:text-lg  sm:text-base text-sm text-[#000] font-normal">
              Interval seconds:
            </label>
            <select
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(Number(e.target.value))}
              className="border-[#adb2b7] border-[1px] md:text-lg  sm:text-base text-sm text-[#000] font-normal rounded-[5px] border-solid bg-transparent px-2 py-1 sm:w-[150px] w-full"
            >
              <option value="0">0 seconds</option>
              {[...Array(59)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1} seconds
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-600 my-4">{error}</p>}

          <div className="my-5 lg:justify-start justify-center flex">
            <button
              className={`relative bg-[#1470FF] max-[350px]:text-base text-lg font-normal text-[#fff] flex justify-center items-center rounded-[5px] px-4 py-2 mt-4`}
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
                Create Schedule
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedules;
