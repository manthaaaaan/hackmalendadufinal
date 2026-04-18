// src/config/keys.js
// This file reads environment variables. 
// Use .env for local development and repository secrets for production.

export const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || "";
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
