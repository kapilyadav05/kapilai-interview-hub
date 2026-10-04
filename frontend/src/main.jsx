import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  Trophy,
  LayoutDashboard,
} from "lucide-react";
import "./styles.css";

/*
  Production:
  VITE_API_URL = https://kapilai-interview-hub.onrender.com

  Local:
  If VITE_API_URL is not available, localhost is used.
*/
const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

console.log("KapilAI API:", API);

function App() {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [active, setActive] = useState(null);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // API Helper
  // --------------------------------------------------

  const apiRequest = async (url, options = {}) => {
    try {
      setError("");

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      const contentType = response.headers.get("content-type");

      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message =
          typeof data === "object"
            ? data.detail || JSON.stringify(data)
            : data;

        throw new Error(message || `Request failed: ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error("API Error:", err);

      setError(
        err.message ||
          "Something went wrong while connecting to the server."
      );

      throw err;
    }
  };

  // --------------------------------------------------
  // Load Topics
  // --------------------------------------------------

  const loadTopics = async () => {
    try {
      setLoading(true);

      const data = await apiRequest(`${API}/api/topics`);

      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Load Questions
  // --------------------------------------------------

  const loadQuestions = async (id = active?.id) => {
    if (!id) {
      setQuestions([]);
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        `${API}/api/questions?topic_id=${id}`
      );

      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (active) {
      loadQuestions(active.id);
    }
  }, [active]);

  // --------------------------------------------------
  // Save Topic
  // --------------------------------------------------

  const saveTopic = async () => {
    if (!form.name?.trim()) {
      alert("Please enter topic name.");
      return;
    }

    try {
      const isEdit = modal === "editTopic";

      const url = isEdit
        ? `${API}/api/topics/${form.id}`
        : `${API}/api/topics`;

      const method = isEdit ? "PUT" : "POST";

      await apiRequest(url, {
        method,
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description || "",
          icon: form.icon || "📚",
        }),
      });

      setModal(null);
      setForm({});

      await loadTopics();

      alert(isEdit ? "Topic updated successfully!" : "Topic added successfully!");
    } catch (err) {
      alert(`Topic save failed: ${err.message}`);
    }
  };

  // --------------------------------------------------
  // Delete Topic
  // --------------------------------------------------

  const deleteTopic = async (id) => {
    const confirmed = window.confirm(
      "Delete this topic and all its questions?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(`${API}/api/topics/${id}`, {
        method: "DELETE",
      });

      if (active?.id === id) {
        setActive(null);
        setView("dashboard");
        setQuestions([]);
      }

      await loadTopics();

      alert("Topic deleted successfully!");
    } catch (err) {
      alert(`Topic delete failed: ${err.message}`);
    }
  };

  // --------------------------------------------------
  // Save Question
  // --------------------------------------------------

  const saveQuestion = async () => {
    if (!active?.id) {
      alert("Please select a topic first.");
      return;
    }

    if (!form.question?.trim()) {
      alert("Please enter question.");
      return;
    }

    try {
      const isEdit = modal === "editQuestion";

      const url = isEdit
        ? `${API}/api/questions/${form.id}`
        : `${API}/api/questions`;

      const method = isEdit ? "PUT" : "POST";

      await apiRequest(url, {
        method,
        body: JSON.stringify({
          question: form.question.trim(),
          answer: form.answer || "",
          difficulty: form.difficulty || "Medium",
          category: form.category || "Interview",
          tags: form.tags || "",
          topic_id: Number(active.id),
        }),
      });

      setModal(null);
      setForm({});

      await loadQuestions(active.id);

      alert(
        isEdit
          ? "Question updated successfully!"
          : "Question added successfully!"
      );
    } catch (err) {
      alert(`Question save failed: ${err.message}`);
    }
  };

  // --------------------------------------------------
  // Delete Question
  // --------------------------------------------------

  const deleteQuestion = async (id) => {
    const confirmed = window.confirm(
      "Delete this question?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(`${API}/api/questions/${id}`, {
        method: "DELETE",
      });

      await loadQuestions();

      alert("Question deleted successfully!");
    } catch (err) {
      alert(`Question delete failed: ${err.message}`);
    }
  };

  // --------------------------------------------------
  // Generate AI Questions
  // --------------------------------------------------

  const generate = async () => {
    if (!active?.name) {
      alert("Please select a topic first.");
      return;
    }

    try {
      setAi("Generating with Ollama...");

      const data = await apiRequest(
        `${API}/api/ai/generate/${encodeURIComponent(active.name)}`,
        {
          method: "POST",
          body: JSON.stringify({
            count: 5,
            difficulty: "Medium",
            category: "Interview",
          }),
        }
      );

      setAi(
        data.content ||
          data.response ||
          data.detail ||
          "No AI response received."
      );
    } catch (err) {
      setAi(`AI Error: ${err.message}`);
    }
  };

  // --------------------------------------------------
  // Open Add Topic
  // --------------------------------------------------

  const openAddTopic = () => {
    setForm({
      name: "",
      description: "",
      icon: "📚",
    });

    setError("");
    setModal("addTopic");
  };

  // --------------------------------------------------
  // Open Add Question
  // --------------------------------------------------

  const openAddQuestion = () => {
    if (!active) {
      alert("Please select a topic first.");
      return;
    }

    setForm({
      question: "",
      answer: "",
      difficulty: "Medium",
      category: "Interview",
      tags: "",
    });

    setError("");
    setModal("addQuestion");
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside>
        <div className="logo">
          <BrainCircuit />
          <b>KapilAI</b>
        </div>

        <button
          onClick={() => {
            setView("dashboard");
            setActive(null);
            setSearch("");
            setError("");
          }}
        >
          <LayoutDashboard />
          Dashboard
        </button>

        <button
          onClick={() => {
            setView("topics");
            setActive(null);
            setError("");
          }}
        >
          <BookOpen />
          Topics
        </button>

        <button
          onClick={() => {
            setView("mock");
            setError("");
          }}
        >
          <Trophy />
          Mock Test
        </button>

        <div className="sideFoot">
          Interview Preparation Hub
          <br />
          <small>kapilai.com</small>
        </div>
      </aside>

      {/* MAIN */}
      <main>

        {/* HEADER */}
        <header>
          <div>
            <h1>
              {active
                ? `${active.icon || "📚"} ${active.name}`
                : "KapilAI"}
            </h1>

            <p>
              {active
                ? "Topic-wise interview questions"
                : "Prepare smarter. Practice better."}
            </p>
          </div>

          <div className="search">
            <Search size={17} />

            <input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div
            style={{
              margin: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#ffe5e5",
              color: "#b00020",
              border: "1px solid #ffb3b3",
            }}
          >
            <b>API Error:</b> {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              padding: "15px",
              textAlign: "center",
            }}
          >
            Loading...
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && !active && (
          <Dashboard
            topics={topics}
            open={(topic) => {
              setActive(topic);
              setView("topic");
            }}
          />
        )}

        {/* TOPICS */}
        {view === "topics" && !active && (
          <Topics
            topics={topics}
            open={(topic) => {
              setActive(topic);
              setView("topic");
            }}
            add={openAddTopic}
            edit={(topic) => {
              setForm({
                id: topic.id,
                name: topic.name || "",
                description: topic.description || "",
                icon: topic.icon || "📚",
              });

              setModal("editTopic");
            }}
            del={deleteTopic}
          />
        )}

        {/* TOPIC QUESTIONS */}
        {view === "topic" && active && (
          <section>

            <div className="actions">

              <button
                className="primary"
                onClick={openAddQuestion}
              >
                <Plus />
                Add Question
              </button>

              <button
                className="aiBtn"
                onClick={generate}
              >
                <BrainCircuit />
                Generate with Ollama
              </button>

              <button
                onClick={() => setView("mock")}
              >
                <Trophy />
                Mock Test
              </button>

            </div>

            {ai && (
              <pre className="aiBox">
                {ai}
              </pre>
            )}

            <div className="questionList">

              {questions
                .filter((q) =>
                  `${q.question || ""} ${q.tags || ""}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((q, i) => (

                  <article
                    className="question"
                    key={q.id}
                  >

                    <span className="num">
                      {i + 1}
                    </span>

                    <div>

                      <h3>
                        {q.question}
                      </h3>

                      <p>
                        {q.answer ||
                          "Answer not added yet."}
                      </p>

                      <div className="meta">

                        <span>
                          {q.difficulty ||
                            "Medium"}
                        </span>

                        <span>
                          {q.category ||
                            "Interview"}
                        </span>

                        {q.tags && (
                          <span>
                            {q.tags}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="qactions">

                      <button
                        onClick={() => {
                          setForm({
                            id: q.id,
                            question:
                              q.question || "",
                            answer:
                              q.answer || "",
                            difficulty:
                              q.difficulty ||
                              "Medium",
                            category:
                              q.category ||
                              "Interview",
                            tags:
                              q.tags || "",
                          });

                          setModal(
                            "editQuestion"
                          );
                        }}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() =>
                          deleteQuestion(q.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </article>

                ))}

              {!loading &&
                questions.length === 0 && (
                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                    }}
                  >
                    <h3>
                      No questions yet
                    </h3>

                    <p>
                      Add your first interview
                      question.
                    </p>
                  </div>
                )}

            </div>
          </section>
        )}

        {/* MOCK TEST */}
        {view === "mock" && (
          <Mock
            topics={topics}
            active={active}
          />
        )}

        {/* MODAL */}
        {modal && (
          <Modal
            modal={modal}
            form={form}
            setForm={setForm}
            close={() => {
              setModal(null);
              setForm({});
              setError("");
            }}
            save={
              modal.includes("Topic")
                ? saveTopic
                : saveQuestion
            }
          />
        )}

      </main>
    </div>
  );
}


// ======================================================
// DASHBOARD
// ======================================================

function Dashboard({ topics, open }) {
  return (
    <section>

      <div className="hero">

        <div>
          <span className="pill">
            AI-POWERED INTERVIEW HUB
          </span>

          <h2>
            Master your interview.
            <br />
            <em>One topic at a time.</em>
          </h2>

          <p>
            Manage questions, practice
            topic-wise and use local Ollama
            AI when you need it.
          </p>
        </div>

        <BrainCircuit size={90} />

      </div>

      <div className="stats">

        <Card
          n={topics.length}
          t="Topics"
        />

        <Card
          n="—"
          t="Questions"
        />

        <Card
          n="—"
          t="Mock Tests"
        />

        <Card
          n="AI"
          t="Ollama"
        />

      </div>

      <h2 className="sectionTitle">
        Learning Roadmap
      </h2>

      <div className="topicGrid">

        {topics.map((topic) => (

          <div
            className="topicCard"
            onClick={() => open(topic)}
            key={topic.id}
          >

            <div className="icon">
              {topic.icon || "📚"}
            </div>

            <h3>
              {topic.name}
            </h3>

            <p>
              {topic.description}
            </p>

            <ChevronRight />

          </div>

        ))}

      </div>

    </section>
  );
}


// ======================================================
// CARD
// ======================================================

const Card = ({ n, t }) => (
  <div className="stat">
    <b>{n}</b>
    <span>{t}</span>
  </div>
);


// ======================================================
// TOPICS
// ======================================================

function Topics({
  topics,
  open,
  add,
  edit,
  del,
}) {
  return (
    <section>

      <div className="pageTitle">

        <div>
          <h2>
            Topics
          </h2>

          <p>
            Add, update and delete your
            interview preparation topics.
          </p>
        </div>

        <button
          className="primary"
          onClick={add}
        >
          <Plus />
          Add Topic
        </button>

      </div>

      <div className="topicGrid">

        {topics.map((topic) => (

          <div
            className="topicCard"
            key={topic.id}
          >

            <div
              onClick={() =>
                open(topic)
              }
            >

              <div className="icon">
                {topic.icon || "📚"}
              </div>

              <h3>
                {topic.name}
              </h3>

              <p>
                {topic.description}
              </p>

            </div>

            <div className="cardBtns">

              <button
                onClick={() =>
                  edit(topic)
                }
              >
                <Edit3 size={15} />
              </button>

              <button
                onClick={() =>
                  del(topic.id)
                }
              >
                <Trash2 size={15} />
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}


// ======================================================
// MOCK TEST
// ======================================================

function Mock({ topics, active }) {

  const [topic, setTopic] =
    useState(
      active?.id ||
      topics[0]?.id ||
      ""
    );

  const [qs, setQs] =
    useState([]);

  const [i, setI] =
    useState(0);

  const [started, setStarted] =
    useState(false);

  const [done, setDone] =
    useState(false);

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const start = async () => {

    if (!topic) {
      alert("Please select a topic.");
      return;
    }

    try {

      setLoading(true);

      const response =
        await fetch(
          `${API}/api/questions?topic_id=${topic}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load questions."
        );
      }

      const data =
        await response.json();

      const shuffled =
        Array.isArray(data)
          ? [...data]
              .sort(
                () => Math.random() - 0.5
              )
              .slice(0, 10)
          : [];

      if (shuffled.length === 0) {
        alert(
          "This topic has no questions yet."
        );
        return;
      }

      setQs(shuffled);
      setI(0);
      setAnswer("");
      setDone(false);
      setStarted(true);

    } catch (err) {

      alert(
        `Mock test error: ${err.message}`
      );

    } finally {

      setLoading(false);

    }
  };

  const nextQuestion = () => {

    if (i + 1 === qs.length) {
      setDone(true);
    } else {
      setI(i + 1);
      setAnswer("");
    }

  };

  return (
    <section className="mock">

      <div className="mockCard">

        <Trophy size={42} />

        <h2>
          Topic-wise Mock Test
        </h2>

        {!started ? (

          <>
            <select
              value={topic}
              onChange={(e) =>
                setTopic(
                  Number(e.target.value)
                )
              }
            >

              {topics.map((t) => (
                <option
                  value={t.id}
                  key={t.id}
                >
                  {t.name}
                </option>
              ))}

            </select>

            <button
              className="primary"
              onClick={start}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Start Mock Test"}
            </button>
          </>

        ) : done ? (

          <>
            <h2>
              Test Completed 🎉
            </h2>

            <p>
              Review your answers and
              practice again.
            </p>

            <button
              onClick={() => {
                setStarted(false);
                setDone(false);
                setI(0);
                setAnswer("");
              }}
            >
              Try Again
            </button>
          </>

        ) : (

          <>

            <p>
              Question {i + 1} / {qs.length}
            </p>

            <h2>
              {qs[i]?.question}
            </h2>

            <textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
            />

            <button
              className="primary"
              onClick={nextQuestion}
            >
              {i + 1 === qs.length
                ? "Finish Test"
                : "Next Question"}
            </button>

          </>

        )}

      </div>

    </section>
  );
}


// ======================================================
// MODAL
// ======================================================

function Modal({
  modal,
  form,
  setForm,
  close,
  save,
}) {

  const isTopic =
    modal.includes("Topic");

  return (
    <div className="overlay">

      <div className="modal">

        <button
          className="close"
          onClick={close}
        >
          <X />
        </button>

        <h2>
          {modal === "addTopic"
            ? "Add Topic"
            : modal === "editTopic"
            ? "Update Topic"
            : modal === "addQuestion"
            ? "Add Question"
            : "Update Question"}
        </h2>

        {isTopic ? (

          <>
            <input
              placeholder="Topic name"
              value={form.name || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <input
              placeholder="Icon"
              value={form.icon || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  icon: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
              value={form.description || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />
          </>

        ) : (

          <>
            <textarea
              placeholder="Question"
              value={form.question || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  question:
                    e.target.value,
                })
              }
            />

            <textarea
              placeholder="Answer"
              value={form.answer || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  answer:
                    e.target.value,
                })
              }
            />

            <select
              value={
                form.difficulty ||
                "Medium"
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  difficulty:
                    e.target.value,
                })
              }
            >
              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>
            </select>

            <select
              value={
                form.category ||
                "Interview"
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >
              <option value="Interview">
                Interview
              </option>

              <option value="Coding">
                Coding
              </option>

              <option value="Concept">
                Concept
              </option>

              <option value="Scenario">
                Scenario
              </option>

              <option value="Advanced">
                Advanced
              </option>
            </select>

            <input
              placeholder="Tags"
              value={form.tags || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value,
                })
              }
            />
          </>

        )}

        <button
          className="primary full"
          onClick={save}
        >
          Save
        </button>

      </div>

    </div>
  );
}


// ======================================================
// START REACT
// ======================================================

createRoot(
  document.getElementById("root")
).render(
  <App />
);