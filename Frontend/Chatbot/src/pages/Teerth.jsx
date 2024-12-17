import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function Teerth() {
  const [que, setQue] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);
  const [arr, setArr] = useState([]);
  const [minimized, setMinimized] = useState(true);

  // Predefined options
  const predefinedOptions = [
    "Best hotels under $100 in Goa",
    "Top-rated hotels near the north goa",
    "cheapest Hotels in Goa",
    "Hotels for family trip in Goa ",
  ];

  // Function to send predefined options as a query
  function handlePredefinedOption(option) {
    setQue(option);
    generatemsg(option);
  }

  async function generatemsg(customQuery = null) {
    const query = customQuery || que;
    if (!query.trim()) return;

    setArr((prevArr) => [...prevArr, { type: "user", text: query }]);
    setAns("Loading...");
    setLoading(true);

    try {
      const hotelResponse = await axios.get(
        `https://chatbot-dubaihotels.onrender.com/gethotels?query=${query}`
      );

      const hotels = hotelResponse.data
        .map(
          (hotel) =>
            `${hotel.hotel_name} in ${hotel.location}, Price: ${hotel.price}`
        )
        .join("\n");

      const geminiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA2vcxj8zmj9B5BtYoJXHslas5gSyGLr2w",
        {
          contents: [
            {
              parts: [
                {
                  text: `Here are some hotels I found for you:\n${hotels}\n\nYour query: ${query} always compare prices`,
                },
              ],
            },
          ],
        }
      );

      const generatedText =
        geminiResponse.data.candidates[0].content.parts[0].text;
      setAns(generatedText);

      setArr((prevArr) => [...prevArr, { type: "bot", text: generatedText }]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAns("Sorry, something went wrong!");
      setArr((prevArr) => [
        ...prevArr,
        { type: "bot", text: "Sorry, something went wrong!" },
      ]);
    } finally {
      setLoading(false);
    }

    setQue("");
  }

  return (
    <div>
      {/* Small floating circle */}
      {minimized && (
        <div
          className="w-14 h-14 bg-purple-600 text-white rounded-full flex justify-center items-center fixed bottom-10 right-10 cursor-pointer shadow-lg"
          onClick={() => setMinimized(false)}
        >
          Chat
        </div>
      )}

      {/* Chatbot window */}
      {!minimized && (
        <div className="z-10 fixed w-[28vw] h-[28vw] bottom-10 right-10 border-2 bg-white rounded-lg flex flex-col shadow-lg">
          {/* Header */}
          <div className="bg-purple-600 text-white p-3 text-lg font-bold rounded-t-lg flex justify-between items-center">
            CodeAI
            <button
              onClick={() => setMinimized(true)}
              className="text-white bg-red-400 px-2 py-1 rounded text-sm"
            >
              Minimize
            </button>
          </div>

          {/* Predefined Options */}
          {arr.length === 0 && (
            <div className="p-4 space-y-2 border-b">
              <div className="text-gray-600 text-sm mb-2">
                Select a query to get started:
              </div>
              {predefinedOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedOption(option)}
                  className="bg-purple-200 text-purple-700 px-3 py-1 rounded-lg mr-2 hover:bg-purple-300 transition"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Message Display */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 w-[25vw] h-[25vw] ">
            {arr.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.type === "user"
                    ? "ml-auto bg-purple-200"
                    : "mr-auto bg-gray-200"
                } p-2 rounded-lg max-w-[70%]`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
          </div>

          {/* Compare Prices Button */}
          {arr.length > 0 && (
            <div className="p-3 flex justify-center border-t">
              {/* <button
                onClick={() => alert("Compare logic goes here")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Compare Prices
              </button> */}
            </div>
          )}

          {/* Input Section */}
          <div className="p-3 flex border-t">
            <input
              type="text"
              value={que}
              onChange={(e) => setQue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  generatemsg();
                }
              }}
              placeholder="Ask about hotels..."
              className="w-full border-2 border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none"
            />
            <button
              onClick={() => generatemsg()}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-r-lg"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
