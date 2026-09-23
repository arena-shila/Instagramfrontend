import { useContext, useState } from "react";
import { UserContext } from "../App";

// TODO: apni asli details yahan daalo
const SUPPORT_EMAIL = "shila@example.com";
const REPLY_TIME = "We usually reply within 1-2 working days.";

const TOPICS = [
  "Report a problem",
  "Account help",
  "Feedback / suggestion",
  "Something else",
];

const inputClass =
  "w-full bg-zinc-800 text-white placeholder:text-zinc-500 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors";

function Contact() {
  const { guser } = useContext(UserContext);
  const [name, setName] = useState(guser?.name || "");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length < 10) return;

    const who = name.trim() || "a user";
    const subject = `[${topic}] from ${who}`;
    const body = `${text}\n\n--\nName: ${name.trim() || "-"}\nUsername: ${
      guser?.username || "-"
    }`;

    // Opens the user's email app with everything filled in
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Contact us</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Found a bug, need help with your account, or have an idea? Tell us.
        </p>

        {/* Info cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
            
             <a href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-1 block text-sm font-medium text-blue-400 hover:text-blue-300 break-all"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Response time</p>
            <p className="mt-1 text-sm text-zinc-200">{REPLY_TIME}</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
        >
          <div>
            <label htmlFor="contact-name" className="block mb-1 text-sm text-zinc-300">
              Your name
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-topic" className="block mb-1 text-sm text-zinc-300">
              Topic
            </label>
            <select
              id="contact-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={inputClass}
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" className="block mb-1 text-sm text-zinc-300">
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              placeholder="Describe what happened or what you need (at least 10 characters)"
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-right text-[11px] text-zinc-500">{message.length}/1000</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            Send message
          </button>
          <p className="text-[11px] text-zinc-500 text-center">
            This opens your email app with the message ready to send.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Contact;