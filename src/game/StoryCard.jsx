import React, { useState } from "react";
import { storyImage } from "./stories.js";

export default function StoryCard({ story, kept, onKeep }) {
  const [language, setLanguage] = useState("en"),
    [failed, setFailed] = useState(false),
    [scene, setScene] = useState(null);
  const scenes = {
    "Rainy evening":
      "The rain stops. Someone leaves an umbrella behind. Two strangers both turn back for it.",
    "Roadside comedy":
      "The last bus is leaving. The driver is ready. The conductor is still arguing about yesterday's football match.",
    "Quiet journey":
      "A window seat, a folded letter, and a road that gets less familiar with every turn.",
  };
  return (
    <article className="kerala-story">
      <span className="game-overline">
        KERALA BEHIND THE WORLD ·{" "}
        {story.image ? "A PHOTO STORY" : "A PLACE STORY"}
      </span>
      <h2 lang={language}>{language === "ml" ? story.mlTitle : story.title}</h2>
      <p className="story-place">
        {story.location} · {story.date}
      </p>
      {story.image && (
        <figure>
          {!failed ? (
            <img
              src={storyImage(story)}
              alt={story.alt}
              width="960"
              height="720"
              decoding="async"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="story-image-fallback">
              The photograph couldn't load. Its story and source are still
              available below.
            </div>
          )}
          <figcaption>
            Photo: {story.author} ·{" "}
            <a href={story.source} target="_blank" rel="noreferrer">
              Original photograph
            </a>{" "}
            ·{" "}
            <a
              href={`https://creativecommons.org/licenses/by-sa/${story.license}/`}
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA {story.license}
            </a>{" "}
            · Resized, not cropped
          </figcaption>
        </figure>
      )}
      <div className="story-languages" role="group" aria-label="Story language">
        <button
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
        >
          English
        </button>
        <button
          lang="ml"
          aria-pressed={language === "ml"}
          onClick={() => setLanguage("ml")}
        >
          മലയാളം
        </button>
      </div>
      <p lang={language} className="story-copy">
        {story[language]}
      </p>
      {language === "ml" && (
        <small>Malayalam wording is a draft awaiting local review.</small>
      )}
      <p className="story-context">
        A real-world connection to fictional Kadal. This world is not a
        geographical recreation.
      </p>
      <details>
        <summary>Sources &amp; the story behind this page</summary>
        <p>
          <a href={story.source} target="_blank" rel="noreferrer">
            {story.sourceLabel ||
              "Photographer’s description and image history"}
          </a>
          {story.factSource && (
            <>
              {" "}
              ·{" "}
              <a href={story.factSource} target="_blank" rel="noreferrer">
                {story.factSourceLabel || "Coir Board: the fibre and its uses"}
              </a>
            </>
          )}
        </p>
        <p>
          Sources checked 8 September 2026. Local editorial review pending.
          {story.image
            ? " Image licence checked; photographed people are not the game’s fictional characters."
            : " This reading board contains no archival photograph or film still."}
        </p>
      </details>
      <p className="story-notice">{story.notice}</p>
      <button className="story-keep" disabled={kept} onClick={onKeep}>
        {kept
          ? "Kept in your passport"
          : story.image
            ? "Keep this photo story"
            : "Keep this story"}
      </button>
      {story.id === "tea-photo" && (
        <details className="story-film-club">
          <summary>Kadal film club · imagine a scene</summary>
          <p>
            Original fiction, made for this village. Pick a mood for a scene you
            might film here.
          </p>
          <div className="story-languages">
            {Object.keys(scenes).map((m) => (
              <button
                key={m}
                aria-pressed={scene === m}
                onClick={() => setScene(m)}
              >
                {m}
              </button>
            ))}
          </div>
          {scene && <p aria-live="polite">{scenes[scene]}</p>}
        </details>
      )}
    </article>
  );
}
