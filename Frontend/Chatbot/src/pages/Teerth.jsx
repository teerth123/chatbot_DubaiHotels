import { useState } from "react";
import axios from "axios";

export default function Teerth() {
  const [que, setQue] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);
  const [arr, setArr] = useState([]);

  async function generatemsg() {
    if (!que.trim()) return;

    setArr((prevArr) => [...prevArr, { type: "user", text: que }]);
    setAns("Loading...");
    setLoading(true);

    try {
      const hotelResponse = await axios.get(
        `http://localhost:3000/gethotels?query=${que}`
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
                  text: `Here are some hotels I found for you:\n${hotels}\n\nYour query: ${que} always compare prices`,
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
    <div className="z-10 fixed w-[28vw] h-[28vw] bottom-10 right-10 border-2 bg-white rounded-lg flex flex-col shadow-lg">
      {/* Header */}
      <div className="bg-purple-600 text-white p-3 text-lg font-bold rounded-t-lg">
        CodeAI
        <div className="text-sm font-light">You can ask anything</div>
      </div>

      {/* Message Display */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {arr.map((msg, index) => (
          <div
            key={index}
            className={`${
              msg.type === "user"
                ? "ml-auto bg-purple-200"
                : "mr-auto bg-gray-200"
            } p-2 rounded-lg max-w-[70%]`}
          >
            {msg.text}
          </div>
        ))}
      </div>

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
          onClick={generatemsg}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-r-lg"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
