import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { BLOG_POSTS, type BlogPost } from "@/data/blog";
import { supabase } from "@/lib/supabase";

export default function BlogBlock() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS.slice(0, 3));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      console.log("Loading posts from Supabase...");
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, image, category, date_text, reading_time, slug")
        .eq("is_active", true)
        .eq("show_on_home", true)
        .order("display_order")
        .limit(3);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data && data.length > 0) {
        const supabasePosts = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || "",
          image: p.image || "",
          category: p.category || "",
          date: p.date_text || "",
          readingTime: p.reading_time || "",
          slug: p.slug,
        }));
        console.log("Successfully loaded from Supabase:", supabasePosts.length, "posts");
        setPosts(supabasePosts);
      } else {
        console.log("No posts returned from Supabase, keeping local data");
      }
    } catch (error) {
      console.error("Exception loading from Supabase:", error);
    }
  };

  return (
    <section className="bg-[#FEF9F3] py-20">
      <div className="container">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl">Блог</h2>
          <Link to="/blog" className="hidden rounded-full border bg-white/70 px-5 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white lg:inline-flex">
            Читать блог
          </Link>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid gap-6 grid-cols-3">
          {posts.map((p, i) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(234,174,92,0.20)]"
            >
              <Link to={`/blog/${p.slug || p.id}`} className="block overflow-hidden group">
                <img
                  src={p.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"}
                  alt={p.title}
                  className="h-48 w-full object-cover shadow-[0_0_0_6px_rgba(234,174,92,0.08)] transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
              <div className="space-y-2 p-5">
                <h3 className="font-semibold tracking-tight">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
                <Link to={`/blog/${p.slug || p.id}`} className="inline-flex text-sm text-primary hover:underline">
                  Читать
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile Carousel Layout */}
        {posts.length > 0 && (
          <div className="lg:hidden">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {posts.map((p) => (
                  <article
                    key={p.id}
                    className="min-w-0 shrink-0 basis-full rounded-2xl border bg-white shadow-sm overflow-hidden"
                  >
                    <Link to={`/blog/${p.slug || p.id}`} className="block overflow-hidden group">
                      <img
                        src={p.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"}
                        alt={p.title}
                        className="h-48 w-full object-cover shadow-[0_0_0_6px_rgba(234,174,92,0.08)] transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <div className="space-y-2 p-5">
                      <h3 className="font-semibold tracking-tight">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.excerpt}</p>
                      <Link to={`/blog/${p.slug || p.id}`} className="inline-flex text-sm text-primary hover:underline">
                        Читать
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {posts.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={scrollPrev} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
                  ←
                </button>
                <button onClick={scrollNext} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
                  →
                </button>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link to="/blog" className="rounded-full border bg-white/70 px-5 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
                Читать блог
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
