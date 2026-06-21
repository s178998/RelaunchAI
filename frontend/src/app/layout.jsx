import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "RelaunchAI",
  description:
    "AI-powered career recovery platform helping professionals rebuild resumes, practice interviews, and find jobs faster.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
