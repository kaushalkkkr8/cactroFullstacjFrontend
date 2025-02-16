import { useState, useEffect } from "react";
import axios from "axios";

function PollApp() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get("https://cactro-full-stack-b-ackend.vercel.app/api/polls");
      setPolls(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  const handlePollCreation = async (e) => {
    e.preventDefault();

    // Convert options to the required format
    const formattedOptions = options
      .filter((opt) => opt.trim() !== "") // Remove empty options
      .map((opt) => ({ text: opt })); // Convert strings to objects with `text` property

    if (!question.trim() || formattedOptions.length < 2) {
      alert("Please enter a question and at least two options.");
      return;
    }

    try {
      const response = await axios.post(
        "https://cactro-full-stack-b-ackend.vercel.app/api/polls",
        {
          question,
          options: formattedOptions,
        }
      );
      setPolls([...polls, response.data]); // Add new poll to state
      setQuestion("");
      setOptions(["", ""]); // Reset form
    } catch (error) {
      console.error("Error creating poll:", error.response?.data || error.message);
    }
  };
  const handleVote = async (pollId, optionIndex) => {
    try {
      const response = await axios.post(`https://cactro-full-stack-b-ackend.vercel.app/api/polls/${pollId}`, { optionIndex });
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll._id === pollId ? { ...poll, options: response.data.options } : poll
        )
      );
      fetchPolls()
    } catch (error) {
      console.error("Error voting on poll:", error.response?.data || error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Poll Voting App</h1>

      <form onSubmit={handlePollCreation} className="mb-5">
        <div className="mb-3">
          <label className="form-label">Poll Question</label>
          <input
            type="text"
            className="form-control"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        {options.map((opt, i) => (
          <div className="mb-3" key={i}>
            <label className="form-label">Option {i + 1}</label>
            <input
              type="text"
              className="form-control"
              value={opt}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[i] = e.target.value;
                setOptions(newOptions);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={() => setOptions([...options, ""])}
        >
          Add Option
        </button>
        <button type="submit" className="btn btn-primary">
          Create Poll
        </button>
      </form>

      {isLoading ? (
        <p>Loading polls...</p>
      ) : (
        polls?.map((poll) => (
          <div key={poll?._id} className="mb-5">
            <h3>{poll.question}</h3>
            {poll?.options?.map((option, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center">
                <span>{option.text}</span>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleVote(poll?._id, index)}
                >
                  Vote ({option?.votes})
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default PollApp;
