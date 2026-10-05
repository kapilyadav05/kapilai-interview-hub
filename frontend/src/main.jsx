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
  Sparkles,
  ArrowUpRight,
  Target,
  Layers3,
  Code2,
  Database,
  Cpu,
  FileCode2,
  Bot,
  Network,
  Server,
  Menu,
  Mail,
  Phone,
  MessageCircle,
  Users,
} from "lucide-react";

import Login from "./pages/Login";
import "./styles.css";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

console.log("KapilAI API:", API);

/* =========================================================
   API HELPER
   JWT TOKEN AUTOMATICALLY ADDED
========================================================= */

async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("kapilai_token");

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      detail: text || "Invalid server response",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

/* =========================================================
   STAT CARD
========================================================= */

function Card({ n, t, icon: Icon }) {
  return (
    <div className="statCard">
      <div className="statIcon">
        <Icon size={20} />
      </div>

      <div className="statInfo">
        <div className="statNumber">{n}</div>
        <div className="statTitle">{t}</div>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [topics, setTopics] = useState([]);

  /* =======================================================
     AUTH USER
  ======================================================= */

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("kapilai_user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const isAdmin = user?.role === "admin";

  const [questions, setQuestions] = useState([]);

  const [active, setActive] = useState(null);

  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [search, setSearch] = useState("");

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [editingTopic, setEditingTopic] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [topicName, setTopicName] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");

  const [ai, setAi] = useState("");

  const [view, setView] = useState("dashboard");

  const [mockTest, setMockTest] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockCompleted, setMockCompleted] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  /* =======================================================
     USERS
     ADMIN ONLY
  ======================================================= */

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    localStorage.removeItem("kapilai_token");
    localStorage.removeItem("kapilai_user");

    setUser(null);

    setTopics([]);
    setQuestions([]);
    setUsers([]);
    setActive(null);
    setAi("");
    setView("dashboard");
    setMobileMenu(false);
  };

  /* =======================================================
     LOAD TOPICS
  ======================================================= */

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);

      const data = await apiRequest(
        `${API}/api/topics`
      );

      setTopics(
        Array.isArray(data)
          ? data
          : data.topics || []
      );
    } catch (err) {
      console.error(err);

      alert(
        `Failed to load topics: ${err.message}`
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  /* =======================================================
     LOAD QUESTIONS
     Backend endpoint:
     GET /api/questions?topic_id=ID
  ======================================================= */

  const loadQuestions = async (topicId) => {
    if (!topicId) return [];

    try {
      setLoadingQuestions(true);

      const data = await apiRequest(
        `${API}/api/questions?topic_id=${encodeURIComponent(
          topicId
        )}`
      );

      const list = Array.isArray(data)
        ? data
        : data.questions || [];

      setQuestions(list);

      return list;
    } catch (err) {
      console.error(err);

      setQuestions([]);

      alert(
        `Failed to load questions: ${err.message}`
      );

      return [];
    } finally {
      setLoadingQuestions(false);
    }
  };

  /* =======================================================
     LOAD USERS
     ADMIN ONLY
  ======================================================= */

  const loadUsers = async () => {
    if (!isAdmin) {
      return;
    }

    try {
      setLoadingUsers(true);

      const data = await apiRequest(
        `${API}/api/auth/users`
      );

      setUsers(
        Array.isArray(data)
          ? data
          : data.users || []
      );
    } catch (err) {
      console.error(err);

      setUsers([]);

      alert(
        `Failed to load users: ${err.message}`
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (user) {
      loadTopics();
    }
  }, [user]);

  /* =======================================================
     LOAD USERS WHEN ADMIN OPENS USERS PAGE
  ======================================================= */

  useEffect(() => {
    if (user && isAdmin && view === "users") {
      loadUsers();
    }
  }, [user, isAdmin, view]);

  /* =======================================================
     SELECT TOPIC
  ======================================================= */

  const selectTopic = async (topic) => {
    if (!topic) return;

    setActive(topic);
    setView("questions");
    setAi("");
    setMobileMenu(false);

    await loadQuestions(topic.id);
  };

  /* =======================================================
     OPEN PREPARATION TOPIC
  ======================================================= */

  const openPreparationTopic = async (topicName) => {
    const matchedTopic = topics.find(
      (topic) =>
        topic.name?.trim().toLowerCase() ===
        topicName.trim().toLowerCase()
    );

    if (matchedTopic) {
      await selectTopic(matchedTopic);
      return;
    }

    alert(
      `"${topicName}" topic is not available in the database. Please create this topic first using Add Topic.`
    );
  };

  /* =======================================================
     CONTACT NAVIGATION
  ======================================================= */

  const goToContact = () => {
    setView("dashboard");
    setMobileMenu(false);

    setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =======================================================
     TOPIC CREATE
     ADMIN ONLY
  ======================================================= */

  const createTopic = async () => {
    if (!isAdmin) {
      alert("Only Admin can add topics.");
      return;
    }

    if (!topicName.trim()) {
      alert("Please enter a topic name.");
      return;
    }

    try {
      await apiRequest(`${API}/api/topics`, {
        method: "POST",

        body: JSON.stringify({
          name: topicName.trim(),
        }),
      });

      setTopicName("");
      setShowTopicModal(false);

      await loadTopics();
    } catch (err) {
      alert(
        `Failed to create topic: ${err.message}`
      );
    }
  };

  /* =======================================================
     TOPIC UPDATE
     ADMIN ONLY
  ======================================================= */

  const updateTopic = async () => {
    if (!isAdmin) {
      alert("Only Admin can update topics.");
      return;
    }

    if (!editingTopic || !topicName.trim()) {
      return;
    }

    try {
      await apiRequest(
        `${API}/api/topics/${editingTopic.id}`,
        {
          method: "PUT",

          body: JSON.stringify({
            name: topicName.trim(),
          }),
        }
      );

      const updatedName = topicName.trim();

      setTopicName("");
      setEditingTopic(null);
      setShowTopicModal(false);

      await loadTopics();

      if (active?.id === editingTopic.id) {
        setActive({
          ...active,
          name: updatedName,
        });
      }
    } catch (err) {
      alert(
        `Failed to update topic: ${err.message}`
      );
    }
  };

  /* =======================================================
     DELETE TOPIC
     ADMIN ONLY
  ======================================================= */

  const deleteTopic = async (topic) => {
    if (!isAdmin) {
      alert("Only Admin can delete topics.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${topic.name}"?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `${API}/api/topics/${topic.id}`,
        {
          method: "DELETE",
        }
      );

      if (active?.id === topic.id) {
        setActive(null);
        setQuestions([]);
        setView("dashboard");
      }

      await loadTopics();
    } catch (err) {
      alert(
        `Failed to delete topic: ${err.message}`
      );
    }
  };

  /* =======================================================
     OPEN TOPIC CREATE
  ======================================================= */

  const openCreateTopic = () => {
    if (!isAdmin) {
      alert("Only Admin can add topics.");
      return;
    }

    setEditingTopic(null);
    setTopicName("");
    setShowTopicModal(true);
  };

  /* =======================================================
     OPEN TOPIC EDIT
  ======================================================= */

  const openEditTopic = (topic) => {
    if (!isAdmin) {
      alert("Only Admin can edit topics.");
      return;
    }

    setEditingTopic(topic);
    setTopicName(topic.name);
    setShowTopicModal(true);
  };

  /* =======================================================
     QUESTION CREATE
     ADMIN ONLY
  ======================================================= */

  const createQuestion = async () => {
    if (!isAdmin) {
      alert("Only Admin can add questions.");
      return;
    }

    if (!active) {
      alert("Please select a topic first.");
      return;
    }

    if (!questionText.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (!answerText.trim()) {
      alert("Please enter an answer.");
      return;
    }

    try {
      await apiRequest(
        `${API}/api/questions`,
        {
          method: "POST",

          body: JSON.stringify({
            topic_id: active.id,
            question: questionText.trim(),
            answer: answerText.trim(),
          }),
        }
      );

      setQuestionText("");
      setAnswerText("");
      setShowQuestionModal(false);

      await loadQuestions(active.id);
    } catch (err) {
      alert(
        `Failed to create question: ${err.message}`
      );
    }
  };

  /* =======================================================
     QUESTION UPDATE
     ADMIN ONLY
  ======================================================= */

  const updateQuestion = async () => {
    if (!isAdmin) {
      alert("Only Admin can update questions.");
      return;
    }

    if (!editingQuestion) return;

    if (!questionText.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (!answerText.trim()) {
      alert("Please enter an answer.");
      return;
    }

    try {
      await apiRequest(
        `${API}/api/questions/${editingQuestion.id}`,
        {
          method: "PUT",

          body: JSON.stringify({
            topic_id: active.id,
            question: questionText.trim(),
            answer: answerText.trim(),
          }),
        }
      );

      setEditingQuestion(null);
      setQuestionText("");
      setAnswerText("");
      setShowQuestionModal(false);

      await loadQuestions(active.id);
    } catch (err) {
      alert(
        `Failed to update question: ${err.message}`
      );
    }
  };

  /* =======================================================
     DELETE QUESTION
     ADMIN ONLY
  ======================================================= */

  const deleteQuestion = async (question) => {
    if (!isAdmin) {
      alert("Only Admin can delete questions.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `${API}/api/questions/${question.id}`,
        {
          method: "DELETE",
        }
      );

      await loadQuestions(active.id);
    } catch (err) {
      alert(
        `Failed to delete question: ${err.message}`
      );
    }
  };

  /* =======================================================
     OPEN QUESTION CREATE
  ======================================================= */

  const openCreateQuestion = () => {
    if (!isAdmin) {
      alert("Only Admin can add questions.");
      return;
    }

    setEditingQuestion(null);
    setQuestionText("");
    setAnswerText("");
    setShowQuestionModal(true);
  };

  /* =======================================================
     OPEN QUESTION EDIT
  ======================================================= */

  const openEditQuestion = (question) => {
    if (!isAdmin) {
      alert("Only Admin can edit questions.");
      return;
    }

    setEditingQuestion(question);

    setQuestionText(
      question.question ||
        question.question_text ||
        ""
    );

    setAnswerText(
      question.answer ||
        question.answer_text ||
        ""
    );

    setShowQuestionModal(true);
  };

  /* =======================================================
     AI GENERATE
  ======================================================= */

  const generate = async () => {
    if (!active?.name) {
      alert("Please select a topic first.");
      return;
    }

    try {
      setAi("Generating with AI...");

      const data = await apiRequest(
        `${API}/api/ai/generate/${encodeURIComponent(
          active.name
        )}`,
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

  /* =======================================================
     START MOCK TEST
  ======================================================= */

  const startMockTest = async () => {
    if (!active) {
      alert("Please select a topic first.");
      return;
    }

    let currentQuestions = questions;

    if (currentQuestions.length === 0) {
      currentQuestions = await loadQuestions(
        active.id
      );
    }

    if (!currentQuestions.length) {
      alert(
        "No questions are available for this topic. Please add questions before starting the mock test."
      );
      return;
    }

    setMockIndex(0);
    setMockAnswers({});
    setMockCompleted(false);
    setMockTest(true);
    setView("mock");
    setMobileMenu(false);
  };

  /* =======================================================
     MOCK ANSWER
  ======================================================= */

  const selectMockAnswer = (answer) => {
    setMockAnswers((prev) => ({
      ...prev,
      [mockIndex]: answer,
    }));
  };

  /* =======================================================
     NEXT MOCK QUESTION
  ======================================================= */

  const nextMockQuestion = () => {
    if (mockIndex < questions.length - 1) {
      setMockIndex((prev) => prev + 1);
    } else {
      setMockCompleted(true);
    }
  };

  /* =======================================================
     RETRY MOCK TEST
  ======================================================= */

  const retryMockTest = () => {
    setMockIndex(0);
    setMockAnswers({});
    setMockCompleted(false);
  };

  /* =======================================================
     FILTER TOPICS
  ======================================================= */

  const filteredTopics = topics.filter((topic) =>
    topic.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =======================================================
     PREPARATION TOPICS
  ======================================================= */

  const preparationTopics = [
    {
      name: "Python",
      icon: Code2,
      label: "Core Programming",
    },
    {
      name: "NumPy",
      icon: Layers3,
      label: "Numerical Computing",
    },
    {
      name: "Pandas",
      icon: Database,
      label: "Data Analysis",
    },
    {
      name: "SQL",
      icon: Database,
      label: "Database & Queries",
    },
    {
      name: "Machine Learning",
      icon: BrainCircuit,
      label: "ML Fundamentals",
    },
    {
      name: "Deep Learning",
      icon: Cpu,
      label: "Neural Networks",
    },
    {
      name: "TensorFlow / PyTorch",
      icon: Cpu,
      label: "Deep Learning Tools",
    },
    {
      name: "Hugging Face",
      icon: Bot,
      label: "AI & Transformers",
    },
    {
      name: "Generative AI",
      icon: Sparkles,
      label: "Modern AI",
    },
    {
      name: "RAG",
      icon: Network,
      label: "Retrieval Systems",
    },
    {
      name: "LangChain",
      icon: Network,
      label: "LLM Framework",
    },
    {
      name: "LlamaIndex",
      icon: Layers3,
      label: "AI Data Framework",
    },
    {
      name: "Vector Database",
      icon: Database,
      label: "Embeddings & Search",
    },
    {
      name: "FastAPI",
      icon: Server,
      label: "Backend Development",
    },
    {
      name: "Django",
      icon: FileCode2,
      label: "Python Web Framework",
    },
  ];

  /* =======================================================
     DASHBOARD
  ======================================================= */

  const dashboard = (
    <div className="dashboard">

      {/* HERO */}

      <section className="hero">

        <div className="heroContent">

          <span className="heroBadge">
            <Sparkles size={15} />
            AI-Powered Interview Platform
          </span>

          <h1>
            Master Your
            <span> Technical Interviews</span>
          </h1>

          <p>
            Learn topic-wise, build your question
            bank, practice mock tests and use
            AI-powered question generation to
            prepare smarter.
          </p>

          <div className="heroButtons">

            {isAdmin && (
              <button
                className="primaryBtn"
                onClick={openCreateTopic}
              >
                <Plus size={18} />
                Add Topic
              </button>
            )}

            <button
              className="secondaryBtn"
              onClick={() => setView("topics")}
            >
              <BookOpen size={18} />
              Browse Topics
            </button>

          </div>

          <div className="heroMiniStats">

            <span>
              <Target size={15} />
              Topic-wise Practice
            </span>

            <span>
              <BrainCircuit size={15} />
              AI Questions
            </span>

            <span>
              <Trophy size={15} />
              Mock Tests
            </span>

          </div>

        </div>

        <div className="heroVisual">

          <div className="heroGlow"></div>

          <div className="heroBrain">
            <BrainCircuit size={115} />
          </div>

          <div className="floatingBadge badgeOne">
            <Sparkles size={15} />
            AI Powered
          </div>

          <div className="floatingBadge badgeTwo">
            <Trophy size={15} />
            Mock Tests
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="stats">

        <Card
          n={topics.length}
          t="Topics"
          icon={BookOpen}
        />

        <Card
          n={questions.length}
          t="Questions"
          icon={FileCode2}
        />

        <Card
          n="AI"
          t="AI Generator"
          icon={BrainCircuit}
        />

        <Card
          n="Mock"
          t="Tests"
          icon={Trophy}
        />

      </section>

      {/* DASHBOARD GRID */}

      <div className="dashboardGrid">

        {/* INTERVIEW PREPARATION */}

        <section className="sectionCard preparationSection">

          <div className="sectionHeader">

            <div>

              <span className="sectionEyebrow">
                <Target size={14} />
                LEARNING PATH
              </span>

              <h2>
                Interview Preparation
              </h2>

              <p>
                Follow a structured path and
                prepare topic-wise for your
                technical interviews.
              </p>

            </div>

            <div className="sectionIcon">
              <Trophy size={24} />
            </div>

          </div>

          <div className="preparationGrid">

            {preparationTopics.map(
              (item, index) => {

                const TopicIcon = item.icon;

                return (
                  <div
                    className="preparationCard"
                    key={item.name}
                    onClick={() =>
                      openPreparationTopic(
                        item.name
                      )
                    }
                    title={`Open ${item.name}`}
                  >

                    <div className="preparationNumber">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="preparationIcon">
                      <TopicIcon size={20} />
                    </div>

                    <div className="preparationContent">

                      <h3>
                        {item.name}
                      </h3>

                      <span>
                        {item.label}
                      </span>

                    </div>

                    <div className="preparationArrow">
                      <ChevronRight size={18} />
                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* QUICK START */}

        <section className="sectionCard quickSection">

          <div className="sectionHeader">

            <div>

              <span className="sectionEyebrow">
                <Sparkles size={14} />
                QUICK ACTIONS
              </span>

              <h2>
                Quick Start
              </h2>

              <p>
                Jump directly into your
                interview preparation.
              </p>

            </div>

            <div className="sectionIcon">
              <LayoutDashboard size={24} />
            </div>

          </div>

          <div className="quickActions">

            {isAdmin && (
              <button
                onClick={openCreateTopic}
              >
                <div className="quickIcon">
                  <Plus size={19} />
                </div>

                <div>
                  <strong>
                    Create Topic
                  </strong>

                  <span>
                    Add a new interview topic
                  </span>
                </div>

                <ArrowUpRight size={18} />
              </button>
            )}

            <button
              onClick={() => setView("topics")}
            >
              <div className="quickIcon">
                <BookOpen size={19} />
              </div>

              <div>
                <strong>
                  View Topics
                </strong>

                <span>
                  Browse your question bank
                </span>
              </div>

              <ArrowUpRight size={18} />
            </button>

            <button
              onClick={() => {
                if (active) {
                  startMockTest();
                } else {
                  setView("topics");
                }
              }}
            >
              <div className="quickIcon">
                <Trophy size={19} />
              </div>

              <div>
                <strong>
                  Start Mock Test
                </strong>

                <span>
                  Test your interview skills
                </span>
              </div>

              <ArrowUpRight size={18} />
            </button>

          </div>

        </section>

      </div>

      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}

      <section
        id="contact"
        className="contactSection"
      >

        <div className="sectionHeader">

          <div>

            <span className="sectionEyebrow">
              <MessageCircle size={14} />
              GET IN TOUCH
            </span>

            <h2>
              Contact Me
            </h2>

            <p>
              Have a question, project idea or
              collaboration opportunity? Feel free
              to connect with me.
            </p>

          </div>

          <div className="sectionIcon">
            <MessageCircle size={24} />
          </div>

        </div>

        <div className="contactGrid">

          {/* EMAIL */}

          <a
            href="mailto:yadavkapil8319@gmail.com"
            className="contactCard"
          >

            <div className="contactIcon emailIcon">
              <Mail size={21} />
            </div>

            <div className="contactContent">

              <span>
                Email
              </span>

              <strong>
                yadavkapil8319@gmail.com
              </strong>

              <small>
                Send me an email
              </small>

            </div>

            <ArrowUpRight size={17} />

          </a>

          {/* MOBILE */}

          <a
            href="tel:+918707428987"
            className="contactCard"
          >

            <div className="contactIcon phoneIcon">
              <Phone size={21} />
            </div>

            <div className="contactContent">

              <span>
                Mobile
              </span>

              <strong>
                +91 8707428987
              </strong>

              <small>
                Call me directly
              </small>

            </div>

            <ArrowUpRight size={17} />

          </a>

          {/* WHATSAPP */}

          <a
            href="https://wa.me/918707428987"
            target="_blank"
            rel="noreferrer"
            className="contactCard"
          >

            <div className="contactIcon whatsappIcon">
              <MessageCircle size={21} />
            </div>

            <div className="contactContent">

              <span>
                WhatsApp
              </span>

              <strong>
                +91 8707428987
              </strong>

              <small>
                Chat with me on WhatsApp
              </small>

            </div>

            <ArrowUpRight size={17} />

          </a>

        </div>

      </section>

    </div>
  );

  /* =======================================================
     TOPICS PAGE
  ======================================================= */

  const topicsPage = (
    <div className="page">

      <div className="pageHeader">

        <div>

          <span className="pageEyebrow">
            TOPIC LIBRARY
          </span>

          <h1>
            Interview Topics
          </h1>

          <p>
            Select a topic to view and
            practice questions.
          </p>

        </div>

        {isAdmin && (
          <button
            className="primaryBtn"
            onClick={openCreateTopic}
          >
            <Plus size={18} />
            Add Topic
          </button>
        )}

      </div>

      <div className="searchBox">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {loadingTopics ? (
        <div className="empty">
          Loading topics...
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="empty">
          <BookOpen size={42} />

          <h3>
            No topics found
          </h3>

          <p>
            {isAdmin
              ? "Create your first interview topic."
              : "No interview topics are available."}
          </p>
        </div>
      ) : (
        <div className="topicGrid">

          {filteredTopics.map((topic) => (
            <div
              className="topicCard"
              key={topic.id}
              onClick={() =>
                selectTopic(topic)
              }
            >

              <div className="topicIcon">
                <BookOpen size={25} />
              </div>

              <div className="topicContent">
                <h3>
                  {topic.name}
                </h3>

                <p>
                  Practice interview questions
                </p>
              </div>

              {isAdmin && (
                <div className="topicActions">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditTopic(topic);
                    }}
                    title="Edit topic"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTopic(topic);
                    }}
                    title="Delete topic"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              )}

              <ChevronRight size={19} />

            </div>
          ))}

        </div>
      )}

    </div>
  );

  /* =======================================================
     QUESTIONS PAGE
  ======================================================= */

  const questionsPage = (
    <div className="page">

      <div className="pageHeader">

        <div>

          <button
            className="backBtn"
            onClick={() => setView("topics")}
          >
            ← Back to Topics
          </button>

          <span className="pageEyebrow">
            QUESTION BANK
          </span>

          <h1>
            {active?.name}
          </h1>

          <p>
            Interview questions and
            AI-powered preparation.
          </p>

        </div>

        {isAdmin && (
          <button
            className="primaryBtn"
            onClick={openCreateQuestion}
          >
            <Plus size={18} />
            Add Question
          </button>
        )}

      </div>

      <div className="actionBar">

        <button
          className="aiBtn"
          onClick={generate}
        >
          <BrainCircuit size={19} />
          Generate with AI
        </button>

        <button
          className="mockBtn"
          onClick={startMockTest}
        >
          <Trophy size={19} />
          Start Mock Test
        </button>

      </div>

      {ai && (
        <div className="aiResponse">

          <div className="aiResponseHeader">
            <div className="aiHeaderIcon">
              <BrainCircuit size={19} />
            </div>

            <div>
              <strong>
                AI Generated Content
              </strong>

              <span>
                Powered by KapilAI
              </span>
            </div>
          </div>

          <div className="aiContent">
            {ai}
          </div>

        </div>
      )}

      {loadingQuestions ? (
        <div className="empty">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="empty">

          <BookOpen size={42} />

          <h3>
            No questions yet
          </h3>

          <p>
            {isAdmin
              ? "Add a question or generate questions using AI."
              : "No questions are available for this topic."}
          </p>

          {isAdmin && (
            <button
              className="primaryBtn"
              onClick={openCreateQuestion}
            >
              <Plus size={17} />
              Add First Question
            </button>
          )}

        </div>
      ) : (
        <div className="questionList">

          {questions.map(
            (question, index) => (
              <div
                className="questionCard"
                key={question.id}
              >

                <div className="questionTop">

                  <span className="questionNumber">
                    Q{index + 1}
                  </span>

                  {isAdmin && (
                    <div className="questionActions">

                      <button
                        onClick={() =>
                          openEditQuestion(
                            question
                          )
                        }
                        title="Edit question"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() =>
                          deleteQuestion(
                            question
                          )
                        }
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  )}

                </div>

                <h3>
                  {question.question ||
                    question.question_text}
                </h3>

                <div className="answerBox">

                  <strong>
                    Answer
                  </strong>

                  <p>
                    {question.answer ||
                      question.answer_text}
                  </p>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );

  /* =======================================================
     MOCK TEST PAGE
  ======================================================= */

  const mockPage = (
    <div className="page">

      {!mockCompleted ? (
        <>

          <div className="mockHeader">

            <div>

              <button
                className="backBtn"
                onClick={() => {
                  setMockTest(false);
                  setView("questions");
                }}
              >
                ← Exit Test
              </button>

              <span className="pageEyebrow">
                MOCK TEST
              </span>

              <h1>
                {active?.name} Mock Test
              </h1>

              <p>
                Question {mockIndex + 1} of{" "}
                {questions.length}
              </p>

            </div>

            <div className="mockHeaderIcon">
              <Trophy size={38} />
            </div>

          </div>

          {questions[mockIndex] && (
            <div className="mockCard">

              <div className="mockProgress">

                <span>
                  Progress
                </span>

                <strong>
                  {Math.round(
                    ((mockIndex + 1) /
                      questions.length) *
                      100
                  )}
                  %
                </strong>

              </div>

              <div className="progressBar">
                <div
                  style={{
                    width: `${
                      ((mockIndex + 1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              <span className="questionNumber">
                Q{mockIndex + 1}
              </span>

              <h2>
                {questions[mockIndex].question ||
                  questions[mockIndex]
                    .question_text}
              </h2>

              <textarea
                className="mockTextarea"
                placeholder="Write your answer here..."
                value={
                  mockAnswers[mockIndex] || ""
                }
                onChange={(e) =>
                  selectMockAnswer(
                    e.target.value
                  )
                }
              />

              <div className="mockFooter">

                <span>
                  {mockIndex + 1} /{" "}
                  {questions.length}
                </span>

                <button
                  className="primaryBtn"
                  onClick={
                    nextMockQuestion
                  }
                >
                  {mockIndex ===
                  questions.length - 1
                    ? "Finish Test"
                    : "Next Question"}

                  <ChevronRight size={18} />
                </button>

              </div>

            </div>
          )}

        </>
      ) : (
        <div className="completedCard">

          <div className="successIcon">
            <Trophy size={50} />
          </div>

          <span className="pageEyebrow">
            TEST COMPLETE
          </span>

          <h1>
            Test Completed 🎉
          </h1>

          <p>
            Great work! Review your answers
            and practice again.
          </p>

          <div className="completedStats">

            <div>
              <strong>
                {questions.length}
              </strong>

              <span>
                Questions
              </span>
            </div>

            <div>
              <strong>
                {Object.keys(
                  mockAnswers
                ).length}
              </strong>

              <span>
                Answered
              </span>
            </div>

          </div>

          <div className="completedButtons">

            <button
              className="primaryBtn"
              onClick={retryMockTest}
            >
              <Trophy size={17} />
              Try Again
            </button>

            <button
              className="secondaryBtn"
              onClick={() => {
                setMockTest(false);
                setView("questions");
              }}
            >
              Back to Questions
            </button>

          </div>

        </div>
      )}

    </div>
  );

  /* =======================================================
     USERS PAGE
     ADMIN ONLY
  ======================================================= */

  const usersPage = (
    <div className="page">

      <div className="pageHeader">

        <div>

          <span className="pageEyebrow">
            USER MANAGEMENT
          </span>

          <h1>
            Users
          </h1>

          <p>
            View registered users and their
            account roles.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            className="sectionIcon"
            style={{
              width: "48px",
              height: "48px",
            }}
          >
            <Users size={23} />
          </div>
        </div>

      </div>

      {loadingUsers ? (
        <div className="empty">
          <Users size={42} />

          <h3>
            Loading users...
          </h3>

          <p>
            Please wait while user data is loading.
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty">

          <Users size={42} />

          <h3>
            No users found
          </h3>

          <p>
            There are no registered users yet.
          </p>

        </div>
      ) : (
        <div
          className="sectionCard"
          style={{
            overflowX: "auto",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <span className="sectionEyebrow">
                <Users size={14} />
                REGISTERED ACCOUNTS
              </span>

              <h2
                style={{
                  margin: "6px 0 0",
                }}
              >
                All Users
              </h2>

            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                padding: "8px 13px",
                borderRadius: "10px",
                background: "rgba(15, 23, 42, 0.06)",
              }}
            >
              {users.length}{" "}
              {users.length === 1
                ? "User"
                : "Users"}
            </div>

          </div>

          <table
            style={{
              width: "100%",
              minWidth: "700px",
              borderCollapse: "collapse",
            }}
          >

            <thead>

              <tr>

                <th
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderBottom:
                      "1px solid rgba(15, 23, 42, 0.10)",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Name
                </th>

                <th
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderBottom:
                      "1px solid rgba(15, 23, 42, 0.10)",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Email
                </th>

                <th
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderBottom:
                      "1px solid rgba(15, 23, 42, 0.10)",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Role
                </th>

                <th
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderBottom:
                      "1px solid rgba(15, 23, 42, 0.10)",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Created
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((item) => (

                <tr key={item.id}>

                  <td
                    style={{
                      padding: "16px 14px",
                      borderBottom:
                        "1px solid rgba(15, 23, 42, 0.07)",
                      fontWeight: 700,
                    }}
                  >
                    {item.name}
                  </td>

                  <td
                    style={{
                      padding: "16px 14px",
                      borderBottom:
                        "1px solid rgba(15, 23, 42, 0.07)",
                    }}
                  >
                    {item.email}
                  </td>

                  <td
                    style={{
                      padding: "16px 14px",
                      borderBottom:
                        "1px solid rgba(15, 23, 42, 0.07)",
                    }}
                  >

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 800,
                        textTransform: "capitalize",
                        background:
                          item.role === "admin"
                            ? "rgba(124, 58, 237, 0.12)"
                            : "rgba(15, 118, 110, 0.10)",
                      }}
                    >
                      {item.role}
                    </span>

                  </td>

                  <td
                    style={{
                      padding: "16px 14px",
                      borderBottom:
                        "1px solid rgba(15, 23, 42, 0.07)",
                    }}
                  >
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );

  /* =======================================================
     TOPIC MODAL
  ======================================================= */

  const topicModal =
    showTopicModal &&
    isAdmin && (
      <div className="modalOverlay">

        <div className="modal">

          <div className="modalHeader">

            <div>
              <span className="modalEyebrow">
                TOPIC
              </span>

              <h2>
                {editingTopic
                  ? "Edit Topic"
                  : "Add Topic"}
              </h2>
            </div>

            <button
              onClick={() =>
                setShowTopicModal(false)
              }
            >
              <X size={20} />
            </button>

          </div>

          <label>
            Topic Name
          </label>

          <input
            className="modalInput"
            type="text"
            placeholder="e.g. Python"
            value={topicName}
            onChange={(e) =>
              setTopicName(e.target.value)
            }
          />

          <div className="modalActions">

            <button
              className="secondaryBtn"
              onClick={() =>
                setShowTopicModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="primaryBtn"
              onClick={
                editingTopic
                  ? updateTopic
                  : createTopic
              }
            >
              {editingTopic
                ? "Update Topic"
                : "Create Topic"}
            </button>

          </div>

        </div>

      </div>
    );

  /* =======================================================
     QUESTION MODAL
  ======================================================= */

  const questionModal =
    showQuestionModal &&
    isAdmin && (
      <div className="modalOverlay">

        <div className="modal largeModal">

          <div className="modalHeader">

            <div>
              <span className="modalEyebrow">
                QUESTION BANK
              </span>

              <h2>
                {editingQuestion
                  ? "Edit Question"
                  : "Add Question"}
              </h2>
            </div>

            <button
              onClick={() =>
                setShowQuestionModal(false)
              }
            >
              <X size={20} />
            </button>

          </div>

          <label>
            Interview Question
          </label>

          <textarea
            className="modalTextarea"
            placeholder="Enter interview question..."
            value={questionText}
            onChange={(e) =>
              setQuestionText(e.target.value)
            }
          />

          <label>
            Answer
          </label>

          <textarea
            className="modalTextarea"
            placeholder="Enter answer..."
            value={answerText}
            onChange={(e) =>
              setAnswerText(e.target.value)
            }
          />

          <div className="modalActions">

            <button
              className="secondaryBtn"
              onClick={() =>
                setShowQuestionModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="primaryBtn"
              onClick={
                editingQuestion
                  ? updateQuestion
                  : createQuestion
              }
            >
              {editingQuestion
                ? "Update Question"
                : "Add Question"}
            </button>

          </div>

        </div>

      </div>
    );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigate = (target) => {

    if (target === "users" && !isAdmin) {
      alert("Admin access required.");
      return;
    }

    setView(target);
    setMobileMenu(false);
  };

  /* =======================================================
     LOGIN CHECK
  ======================================================= */

  if (!user) {
    return (
      <Login
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />
    );
  }

  /* =======================================================
     APP RETURN
  ======================================================= */

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div
          className="brand"
          onClick={() => navigate("dashboard")}
        >

          <div className="brandIcon">
            <BrainCircuit size={23} />
          </div>

          <div className="brandText">
            <strong>
              KapilAI
            </strong>

            <span>
              Interview Hub
            </span>
          </div>

        </div>

        <button
          className="mobileMenuBtn"
          onClick={() =>
            setMobileMenu(!mobileMenu)
          }
        >
          {mobileMenu ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

        <nav
          className={
            mobileMenu
              ? "navOpen"
              : ""
          }
        >

          <button
            className={
              view === "dashboard"
                ? "navActive"
                : ""
            }
            onClick={() =>
              navigate("dashboard")
            }
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            className={
              view === "topics" ||
              view === "questions"
                ? "navActive"
                : ""
            }
            onClick={() =>
              navigate("topics")
            }
          >
            <BookOpen size={16} />
            Topics
          </button>

          <button
            className={
              view === "mock"
                ? "navActive"
                : ""
            }
            onClick={() => {
              if (active) {
                startMockTest();
              } else {
                navigate("topics");
              }
            }}
          >
            <Trophy size={16} />
            Mock Test
          </button>

          {/* ADMIN ONLY USERS */}

          {isAdmin && (
            <button
              className={
                view === "users"
                  ? "navActive"
                  : ""
              }
              onClick={() =>
                navigate("users")
              }
            >
              <Users size={16} />
              Users
            </button>
          )}

          <button
            onClick={goToContact}
          >
            <MessageCircle size={16} />
            Contact
          </button>

          {/* USER INFO */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginLeft: "10px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {user?.name}
              {" "}
              ({user?.role})
            </span>

            <button
              onClick={logout}
              title="Logout"
            >
              Logout
            </button>
          </div>

        </nav>

      </header>

      {/* MAIN */}

      <main>

        {view === "dashboard" &&
          dashboard}

        {view === "topics" &&
          topicsPage}

        {view === "questions" &&
          questionsPage}

        {view === "mock" &&
          mockPage}

        {view === "users" &&
          isAdmin &&
          usersPage}

      </main>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footerBrand">

          <div className="brandIcon small">
            <BrainCircuit size={19} />
          </div>

          <div>
            <strong>
              KapilAI
            </strong>

            <p>
              AI-powered Interview
              Preparation Platform
            </p>
          </div>

        </div>

        <div>
          © {new Date().getFullYear()} KapilAI.
          All rights reserved.
        </div>

      </footer>

      {topicModal}

      {questionModal}

    </div>
  );
}

/* =========================================================
   RENDER
========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);