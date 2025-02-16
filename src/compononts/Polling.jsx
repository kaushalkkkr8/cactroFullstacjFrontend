import { useState, useEffect } from "react";
import axios from "axios";

function PollApp() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    fetchPolls();
  }, []);

  // Fetch all polls
  const fetchPolls = async () => {
    try {
      const response = await axios.get("https://cactro-full-stack-b-ackend.vercel.app/api/polls");
      setPolls(response.data);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle poll creation
  const handlePollCreation = async (event) => {
    event.preventDefault();
    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (!question.trim() || filteredOptions.length < 2) {
      alert("Please enter a question and at least two options.");
      return;
    }

    try {
      const response = await axios.post("https://cactro-full-stack-b-ackend.vercel.app/api/polls", {
        question,
        options: filteredOptions,
      });
      setPolls([...polls, response.data]);
      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  // Handle option selection for voting
  const handleOptionChange = (pollId, optionIndex) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [pollId]: optionIndex,
    }));
  };

  // Handle voting
  const handleVote = async (pollId) => {
    const optionIndex = selectedOptions[pollId];
    if (optionIndex === undefined) {
      alert("Please select an option before submitting your vote.");
      return;
    }

    try {
      const response = await axios.post(
        `https://cactro-full-stack-b-ackend.vercel.app/api/polls/${pollId}`,
        { optionIndex }
      );

      // Update polls with the latest votes
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll._id === pollId ? { ...poll, options: response.data.poll.options } : poll
        )
      );

      alert("Vote submitted successfully!");
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Poll Voting App</h1>

      {/* Poll Creation */}
      <form onSubmit={handlePollCreation} className="mb-5">
        <h2>Create a Poll</h2>
        <div className="mb-3">
          <label className="form-label">Question</label>
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

      {/* Poll Voting */}
      <h2 className="mb-4">Available Polls</h2>
      {isLoading ? (
        <p>Loading polls...</p>
      ) : polls.length > 0 ? (
        polls.map((poll) => (
          <div key={poll._id} className="mb-4">
            <h5 className="mb-3">{poll.question}</h5>
            <form>
              <ul className="list-unstyled">
                {poll.options.map((option, index) => (
                  <li
                    key={index}
                    className="d-flex align-items-center justify-content-between border-bottom py-2"
                  >
                    <div className="form-check d-flex align-items-center">
                      <input
                        type="radio"
                        id={`${poll._id}-${index}`}
                        name={`poll-${poll._id}`}
                        value={index}
                        checked={selectedOptions[poll._id] === index}
                        onChange={() => handleOptionChange(poll._id, index)}
                        className="form-check-input me-2"
                      />
                      <label htmlFor={`${poll._id}-${index}`} className="form-check-label">
                        {option.text}
                      </label>
                    </div>

                    <span className="badge bg-primary">{option.votes} Votes</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-success mt-3"
                onClick={() => handleVote(poll._id)}
              >
                Submit Vote
              </button>
            </form>
          </div>
        ))
      ) : (
        <p>No polls available. Create one above!</p>
      )}
    </div>
  );
}

export default PollApp;
