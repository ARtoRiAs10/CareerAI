import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "CareerAI - Smart Job Recommendations",
  description: "AI-powered job recommendations and cover letter generator",
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
