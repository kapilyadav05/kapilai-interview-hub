import React, { useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let response;

      if (mode === "register") {
        response = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });
      } else {
        response = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
      }

      const text = await response.text();

      let data = {};

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
            "Something went wrong"
        );
      }

      if (mode === "register") {
        setSuccess(
          "Registration successful! Please log in."
        );

        setMode("login");
        setName("");
        setPassword("");

        return;
      }

      if (!data.access_token || !data.user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      localStorage.setItem(
        "kapilai_token",
        data.access_token
      );

      localStorage.setItem(
        "kapilai_user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (err) {
      setError(
        err.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* BACKGROUND EFFECTS */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>
      <div className="login-grid"></div>

      <div className="login-wrapper">
        {/* LEFT BRAND PANEL */}
        <div className="login-brand-panel">
          <div className="brand-orbit brand-orbit-one"></div>
          <div className="brand-orbit brand-orbit-two"></div>

          <div className="brand-content">
            <div className="brand-icon">
              <span>K</span>
              <div className="brand-spark">✦</div>
            </div>

            <div className="brand-name">
              Kapil<span>AI</span>
            </div>

            <div className="brand-line"></div>

            <h1>
              AI Interview
              <br />
              <span>Preparation Hub</span>
            </h1>

            <p>
              Prepare smarter. Practice better.
              <br />
              Build confidence with AI-powered
              interview preparation.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <div className="feature-icon">✦</div>
                <div>
                  <strong>AI Powered</strong>
                  <span>Smart interview assistance</span>
                </div>
              </div>

              <div className="brand-feature">
                <div className="feature-icon">✓</div>
                <div>
                  <strong>Practice & Improve</strong>
                  <span>Topic-wise interview preparation</span>
                </div>
              </div>

              <div className="brand-feature">
                <div className="feature-icon">◈</div>
                <div>
                  <strong>Track Your Progress</strong>
                  <span>Test your knowledge with mock tests</span>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 KapilAI · Interview Hub
          </div>
        </div>

        {/* LOGIN PANEL */}
        <div className="login-card">
          {/* MOBILE BRAND */}
          <div className="mobile-brand">
            <div className="mobile-brand-icon">K</div>
            <div>
              <strong>
                Kapil<span>AI</span>
              </strong>
              <small>Interview Hub</small>
            </div>
          </div>

          {/* HEADER */}
          <div className="login-header">
            <div className="welcome-badge">
              <span className="status-dot"></span>
              {mode === "login"
                ? "Welcome back"
                : "Get started"}
            </div>

            <h2>
              {mode === "login"
                ? "Sign in to KapilAI"
                : "Create your account"}
            </h2>

            <p>
              {mode === "login"
                ? "Continue your interview preparation journey."
                : "Start preparing for your next interview today."}
            </p>
          </div>

          {/* TABS */}
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={
                mode === "register" ? "active" : ""
              }
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
            >
              Register
            </button>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="auth-alert error-alert">
              <span>!</span>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="auth-alert success-alert">
              <span>✓</span>
              <div>{success}</div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="form-group">
                <label>Name</label>

                <div className="input-wrapper">
                  <span className="input-icon">◉</span>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">@</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span className="input-icon">◆</span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </span>

              {!loading && (
                <span className="submit-arrow">→</span>
              )}
            </button>
          </form>

          {/* BOTTOM INFO */}
          <div className="login-bottom">
            {mode === "login" ? (
              <>
                <span>New to KapilAI?</span>

                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>

                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="security-note">
            <span>🔒</span>
            <span>Your account information is securely protected.</span>
          </div>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(99, 102, 241, 0.20),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(124, 58, 237, 0.18),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #080b1c 0%,
              #10152d 45%,
              #080b19 100%
            );
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .login-grid {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px
            );
          background-size: 45px 45px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent
          );
        }

        .login-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(80px);
          pointer-events: none;
        }

        .login-glow-one {
          width: 280px;
          height: 280px;
          top: -100px;
          left: -80px;
          background: rgba(79, 70, 229, 0.35);
        }

        .login-glow-two {
          width: 300px;
          height: 300px;
          right: -100px;
          bottom: -120px;
          background: rgba(139, 92, 246, 0.30);
        }

        .login-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1050px;
          min-height: 650px;
          display: grid;
          grid-template-columns: 1fr 0.92fr;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 30px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.10);
        }

        /* BRAND PANEL */

        .login-brand-panel {
          position: relative;
          overflow: hidden;
          padding: 65px 58px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            linear-gradient(
              145deg,
              rgba(79, 70, 229, 0.88),
              rgba(76, 29, 149, 0.82)
            );
        }

        .login-brand-panel::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          top: -220px;
          right: -180px;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow:
            0 0 0 50px rgba(255,255,255,0.025),
            0 0 0 100px rgba(255,255,255,0.018);
        }

        .login-brand-panel::after {
          content: "";
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          bottom: -240px;
          left: -180px;
          border: 1px solid rgba(255,255,255,0.10);
        }

        .brand-content {
          position: relative;
          z-index: 2;
        }

        .brand-icon {
          width: 76px;
          height: 76px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
          border-radius: 23px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.24);
          box-shadow:
            0 15px 35px rgba(0,0,0,0.18),
            inset 0 1px 0 rgba(255,255,255,0.2);
          backdrop-filter: blur(12px);
        }

        .brand-icon span {
          font-size: 38px;
          font-weight: 900;
          color: white;
        }

        .brand-spark {
          position: absolute;
          right: -8px;
          top: -8px;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: white;
          color: #6d28d9;
          font-size: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.18);
        }

        .brand-name {
          color: white;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.8px;
        }

        .brand-name span {
          color: #c4b5fd;
        }

        .brand-line {
          width: 55px;
          height: 4px;
          margin: 22px 0 25px;
          border-radius: 20px;
          background: #c4b5fd;
        }

        .login-brand-panel h1 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1.08;
          letter-spacing: -2px;
          font-weight: 900;
        }

        .login-brand-panel h1 span {
          color: #c4b5fd;
        }

        .login-brand-panel p {
          margin: 22px 0 0;
          color: rgba(255,255,255,0.76);
          font-size: 15px;
          line-height: 1.7;
        }

        .brand-features {
          margin-top: 38px;
          display: grid;
          gap: 17px;
        }

        .brand-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          color: white;
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.12);
          font-weight: 800;
        }

        .brand-feature div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-feature strong {
          font-size: 13px;
        }

        .brand-feature span {
          color: rgba(255,255,255,0.62);
          font-size: 11px;
        }

        .brand-footer {
          position: relative;
          z-index: 2;
          color: rgba(255,255,255,0.42);
          font-size: 11px;
        }

        .brand-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .brand-orbit-one {
          width: 300px;
          height: 300px;
          right: -150px;
          top: 100px;
        }

        .brand-orbit-two {
          width: 500px;
          height: 500px;
          right: -250px;
          top: 0;
        }

        /* LOGIN CARD */

        .login-card {
          padding: 62px 58px;
          background: rgba(255,255,255,0.97);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mobile-brand {
          display: none;
        }

        .login-header {
          margin-bottom: 27px;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          margin-bottom: 13px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px rgba(34,197,94,0.12);
        }

        .login-header h2 {
          margin: 0;
          color: #0f172a;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .login-header p {
          margin: 9px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        /* TABS */

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 4px;
          margin-bottom: 25px;
          border-radius: 13px;
          background: #f1f5f9;
        }

        .auth-tabs button {
          border: none;
          padding: 11px;
          border-radius: 10px;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .auth-tabs button.active {
          background: white;
          color: #4f46e5;
          box-shadow:
            0 4px 12px rgba(15,23,42,0.08);
        }

        /* ALERTS */

        .auth-alert {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 18px;
          padding: 11px 13px;
          border-radius: 11px;
          font-size: 12px;
          line-height: 1.5;
        }

        .auth-alert span {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: 900;
        }

        .error-alert {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
        }

        .error-alert span {
          background: #ffe4e6;
        }

        .success-alert {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }

        .success-alert span {
          background: #dcfce7;
        }

        /* FORM */

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #818cf8;
          font-size: 15px;
          font-weight: 800;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          height: 50px;
          padding: 0 14px 0 43px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          background: #f8fafc;
          color: #0f172a;
          font-size: 13px;
          transition: 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #94a3b8;
        }

        .input-wrapper input:hover {
          border-color: #c7d2fe;
          background: #ffffff;
        }

        .input-wrapper input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow:
            0 0 0 4px rgba(99,102,241,0.10);
        }

        /* SUBMIT */

        .login-submit {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 6px;
          border: none;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );
          color: white;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow:
            0 10px 25px rgba(79,70,229,0.25);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 15px 30px rgba(79,70,229,0.32);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .submit-arrow {
          font-size: 20px;
          line-height: 1;
        }

        /* BOTTOM */

        .login-bottom {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 24px;
          font-size: 12px;
          color: #64748b;
        }

        .login-bottom button {
          padding: 0;
          border: none;
          background: none;
          color: #4f46e5;
          font-weight: 800;
          cursor: pointer;
        }

        .login-bottom button:hover {
          text-decoration: underline;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 10px;
        }

        /* RESPONSIVE */

        @media (max-width: 850px) {
          .login-page {
            padding: 18px;
          }

          .login-wrapper {
            max-width: 500px;
            min-height: auto;
            display: block;
            border-radius: 25px;
          }

          .login-brand-panel {
            display: none;
          }

          .login-card {
            padding: 38px 30px;
            border-radius: 25px;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 28px;
          }

          .mobile-brand-icon {
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background:
              linear-gradient(
                135deg,
                #4f46e5,
                #7c3aed
              );
            color: white;
            font-size: 22px;
            font-weight: 900;
            box-shadow:
              0 8px 20px rgba(79,70,229,0.22);
          }

          .mobile-brand div:last-child {
            display: flex;
            flex-direction: column;
          }

          .mobile-brand strong {
            color: #0f172a;
            font-size: 21px;
          }

          .mobile-brand strong span {
            color: #6d28d9;
          }

          .mobile-brand small {
            margin-top: 1px;
            color: #64748b;
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 0;
          }

          .login-wrapper {
            min-height: 100vh;
            width: 100%;
            border: none;
            border-radius: 0;
          }

          .login-card {
            min-height: 100vh;
            padding: 30px 22px;
            justify-content: center;
            border-radius: 0;
          }

          .login-header h2 {
            font-size: 27px;
          }

          .login-header p {
            font-size: 12px;
          }

          .security-note {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
}