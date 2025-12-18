import { useEffect } from "react";

export type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "profile" | "event";
  jsonLd?: Record<string, any> | null;
};

function ensureMeta(name: string, content: string) {
  let meta = document.head.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function ensureProperty(prop: string, content: string) {
  let meta = document.head.querySelector(`meta[property='${prop}']`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", prop);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function ensureScript(id: string, type: string, text: string) {
  if (!document.getElementById(id)) {
    const s = document.createElement("script");
    s.type = type;
    s.id = id;
    s.text = text;
    document.head.appendChild(s);
  }
}

export default function SEO({ title, description, image, type = "website", jsonLd }: SEOProps) {
  useEffect(() => {
    console.log('SEO component rendering with:', { title, description, image });

    // Set document title
    if (title) {
      console.log('Setting document.title to:', title);
      document.title = title;
    }

    if (description) ensureMeta("description", description);

    ensureProperty("og:site_name", "Активация Кундалини");
    if (title) ensureProperty("og:title", title);
    if (description) ensureProperty("og:description", description);
    if (image) ensureProperty("og:image", image);
    ensureProperty("og:type", type);

    if (title) {
      if (!document.head.querySelector("meta[name='twitter:title']")) ensureMeta("twitter:title", title);
    }
    if (description) {
      if (!document.head.querySelector("meta[name='twitter:description']")) ensureMeta("twitter:description", description);
    }
    if (image) {
      if (!document.head.querySelector("meta[name='twitter:image']")) ensureMeta("twitter:image", image);
    }
    if (!document.head.querySelector("meta[name='twitter:card']")) ensureMeta("twitter:card", "summary_large_image");

    if (jsonLd) {
      ensureScript(
        `jsonld-${type}`,
        "application/ld+json",
        JSON.stringify(jsonLd)
      );
    }
  }, [title, description, image, type, jsonLd]);

  return null;
}
