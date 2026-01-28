import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;
console.log("ADMIN_URL:", ADMIN_URL);

/* ---------- STYLES (UI ONLY) ---------- */
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #6a6fdc 0%, #7a5cc7 50%, #6f4fbf 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },

 headerText: {
  color: "rgba(255,255,255,0.98)",
  fontSize: "20px",        // ⬅ bigger
  fontWeight: "700",       // ⬅ bold
  marginBottom: "22px",
  letterSpacing: "0.6px",  // ⬅ cleaner look
  textAlign: "center",
},


  card: {
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(8px)",
    padding: "42px 38px",
    width: "380px",
    borderRadius: "20px",
    boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#1a202c",
    fontSize: "28px",
    fontWeight: "700",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    outline: "none",
    marginBottom: "20px",
    transition: "all 0.2s ease",
  },

  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "10px",
  },

  primaryButton: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    background:
      "linear-gradient(135deg, #6a6fdc 0%, #7a5cc7 50%, #6f4fbf 100%)",
    color: "white",
    boxShadow: "0 10px 25px rgba(106,111,220,0.45)",
    transition: "all 0.25s ease",
  },

  secondaryButton: {
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "14px",
    border: "2px solid #e2e8f0",
    cursor: "pointer",
    background: "#f8fafc",
    color: "#5a67d8",
    transition: "all 0.2s ease",
  },

  error: {
    color: "#c53030",
    fontSize: "14px",
    marginTop: "18px",
    textAlign: "center",
    fontWeight: "500",
  },

  terms: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "13px",
    marginTop: "22px",
    textAlign: "center",
    maxWidth: "420px",
    lineHeight: "1.5",
  },
};
/* ---------- END STYLES ---------- */

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async () => {
    try {
      const response = await fetch(`${ADMIN_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setOtpSent(true);
        setErrorMessage("");
        alert("OTP sent successfully! Check your email.");
      } else {
        const error = await response.json();
        setErrorMessage(error.message);
      }
    } catch (error) {
      setErrorMessage("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(`${ADMIN_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          login(data.token, data.role, data.email);
          alert("Login successful!");

          if (data.role === "admin") navigate("/admin");
          else if (data.role === "student") navigate("/student/enroll");
          else if (data.role === "faculty") navigate("/home");
          else navigate("/default-dashboard");
        } else {
          alert("Login failed");
        }
      } else {
        const error = await response.json();
        setErrorMessage(error.message);
      }
    } catch (error) {
      setErrorMessage("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <div style={styles.page}>
      <p style={styles.headerText}>
        Academic Information Management System
      </p>

      <div style={styles.card}>
        <h2 style={styles.heading}>Login</h2>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {otpSent && (
          <>
            <label style={styles.label}>OTP</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </>
        )}

        <div style={styles.buttonGroup}>
          {!otpSent ? (
            <button style={styles.primaryButton} onClick={handleSendOtp}>
              Send OTP
            </button>
          ) : (
            <button style={styles.primaryButton} onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          )}

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/login-options")}
          >
            All Login Options
          </button>
        </div>

        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      </div>

      <p style={styles.terms}>
        By proceeding with the login, you agree to the terms of use of this service.
      </p>
    </div>
  );
}

export default Login;