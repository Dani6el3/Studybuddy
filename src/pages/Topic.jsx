import { useState } from "react";
import { ArrowLeft, BookOpen, Link, NotebookPen, Trash2 } from "lucide-react";
import { courses } from "../data/courses";
import { topicKey, youtubeId, safeUrl } from "../lib/study";
import { PageHead, External } from "../components/UI";
import Flashcards from "../components/Flashcards";
export default function Topic({ code, index, data, update }) {
  const course = courses.find((c) => c.code === code);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  if (!course || !Number.isInteger(index) || index < 0 || index > 3)
    return (
      <>
        <PageHead title="Topic not found" />
        <a href="#courses">Back to courses</a>
      </>
    );
  const topic = course.topics[index];
  const key = topicKey(code, index);
  const links = data.links[key] || [];
  const query = encodeURIComponent(`${topic} ${course.keywords}`);
  const setLinks = (next) =>
    update((d) => ({ ...d, links: { ...d.links, [key]: next } }));
  return (
    <>
      <a className="back-link" href={`#courses/${encodeURIComponent(code)}`}>
        <ArrowLeft size={16} />
        {code} · All topics
      </a>
      <div className="topic-header">
        <PageHead eyebrow={`${code} · TOPIC ${index + 1} OF 4`} title={topic} />
      </div>
      <div className="stack">
        <section className="card">
          <h2 className="section-title">
            <BookOpen size={21} />
            Resources
          </h2>
          <p className="section-copy">
            Find a fresh explanation or go deeper. External resources need an
            internet connection.
          </p>
          <div className="resource-grid">
            <External
              href={`https://www.youtube.com/results?search_query=${query}%20lecture`}
            >
              Watch on YouTube · lectures
            </External>
            <External
              href={`https://www.youtube.com/results?search_query=${query}%20explained%20short`}
            >
              YouTube · short explainers
            </External>
            <External
              href={`https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`}
            >
              Search Google Scholar
            </External>
            <External
              href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topic)}`}
            >
              Search PubMed
            </External>
          </div>
          <h3>Reference books</h3>
          <ul className="books">
            {course.books.map((book) => (
              <li key={book}>{book}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="section-title">
            <Link size={21} />
            My saved links
          </h2>
          <p className="section-copy">
            Keep the videos and websites that help it click.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const safe = safeUrl(url);
              if (!safe) {
                setError(
                  "Use a full website URL starting with https:// or http://.",
                );
                return;
              }
              setLinks([
                ...links,
                { id: crypto.randomUUID(), title: title.trim(), url: safe },
              ]);
              setTitle("");
              setUrl("");
              setError("");
            }}
          >
            <label className="field">
              Link title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="e.g. My favourite explanation"
              />
            </label>
            <label className="field">
              YouTube or website URL
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://…"
              />
            </label>
            {error && (
              <p role="alert" className="notice">
                {error}
              </p>
            )}
            <button type="submit" className="primary">
              Save link
            </button>
          </form>
          <div className="stack section-gap">
            {links.map((link) => {
              const id = youtubeId(link.url);
              return (
                <div className="saved-link" key={link.id}>
                  {id && (
                    <img
                      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                      alt={`Thumbnail for ${link.title}`}
                      loading="lazy"
                    />
                  )}
                  <a
                    href={safeUrl(link.url) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title}
                  </a>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${link.title}`}
                    onClick={() =>
                      setLinks(links.filter((v) => v.id !== link.id))
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>
          {!links.length && (
            <p className="empty">
              No saved links yet. Add your first useful resource above.
            </p>
          )}
        </section>
        <section className="card">
          <h2 className="section-title">
            <NotebookPen size={21} />
            My notes
          </h2>
          <label className="field">
            Your understanding, in your words
            <textarea
              value={data.notes[key] || ""}
              onChange={(e) => {
                const value = e.target.value;
                update((d) => ({ ...d, notes: { ...d.notes, [key]: value } }));
              }}
              placeholder="Summarise the key ideas, note a question, or explain a concept…"
            />
          </label>
          <p className="section-copy">
            Auto-saved on this device as you type. Export a backup in Settings.
          </p>
        </section>
        <Flashcards
          cards={data.cards[key] || []}
          onChange={(cards) =>
            update((d) => ({ ...d, cards: { ...d.cards, [key]: cards } }))
          }
        />
      </div>
    </>
  );
}
