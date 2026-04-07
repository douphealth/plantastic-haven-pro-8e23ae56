import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Plus, X, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data || []);
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

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground text-sm">Share tips, ask questions, show off your plants</p>
          </div>
          <Button variant="hero" onClick={() => setShowNew(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
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
              placeholder="Share your thoughts..."
              className="w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none"
              required
            />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="general">General</option>
              <option value="question">Question</option>
              <option value="tip">Tip</option>
              <option value="showcase">Showcase</option>
              <option value="swap">Swap</option>
            </select>
            <Button type="submit" variant="hero" className="rounded-xl">Post</Button>
          </form>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-card border border-border">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading text-lg font-semibold text-card-foreground">{post.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${categoryColor[post.category] || categoryColor.general}`}>
                    {post.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {post.profiles?.display_name || "Anonymous"}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes_count}</span>
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
