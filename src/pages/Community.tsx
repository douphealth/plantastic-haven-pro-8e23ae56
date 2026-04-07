import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Plus, X, Heart, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";

const categories = ["all", "general", "question", "tip", "showcase", "swap"] as const;

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    const postsData = data || [];
    setPosts(postsData);

    // Fetch profiles for unique user_ids
    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      (profilesData || []).forEach((p: any) => { map[p.user_id] = p.display_name || "Anonymous"; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      category: form.category,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post created! 🌿" });
      setForm({ title: "", content: "", category: "general" });
      setShowNew(false);
      fetchPosts();
    }
  };

  const categoryColor: Record<string, string> = {
    general: "bg-muted text-muted-foreground",
    question: "bg-sky/10 text-sky",
    tip: "bg-primary/10 text-primary",
    showcase: "bg-secondary/10 text-secondary",
    swap: "bg-bloom/10 text-bloom",
  };

  const categoryEmoji: Record<string, string> = {
    general: "💬",
    question: "❓",
    tip: "💡",
    showcase: "🌸",
    swap: "🔄",
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = !search || post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground text-sm">{posts.length} posts · Share tips, ask questions, show off your plants</p>
          </div>
          <Button variant="hero" onClick={() => setShowNew(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </div>

        {/* Search + filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="pl-10 rounded-xl" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border hover:bg-accent"
                }`}
              >
                {cat === "all" ? "🌍 All" : `${categoryEmoji[cat] || ""} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {showNew && (
          <form onSubmit={createPost} className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold">Create Post</h2>
              <button type="button" onClick={() => setShowNew(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" required />
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Share your thoughts, ask a question, or show off your plants..."
              className="w-full h-32 rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <div className="flex items-center gap-3">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="general">💬 General</option>
                <option value="question">❓ Question</option>
                <option value="tip">💡 Tip</option>
                <option value="showcase">🌸 Showcase</option>
                <option value="swap">🔄 Swap</option>
              </select>
              <Button type="submit" variant="hero" className="rounded-xl flex-1">Post to Community</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-card border border-border">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold text-card-foreground mb-1">
              {search ? "No posts match your search" : "No posts yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {search ? "Try different keywords" : "Be the first to share something with the community!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${categoryColor[post.category] || categoryColor.general}`}>
                        {categoryEmoji[post.category]} {post.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-card-foreground">{post.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {(profiles[post.user_id] || "A")[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{profiles[post.user_id] || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-bloom transition-colors">
                      <Heart className="w-3.5 h-3.5" /> {post.likes_count}
                    </button>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Community;
