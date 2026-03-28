import React, { useState, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Search,
  Filter,
  Pin,
  MessageCircle,
  TrendingUp,
  Route,
  Shield,
  Lightbulb,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Community() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general"
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {}
  };

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["discussions", selectedCategory],
    queryFn: async () => {
      const filter = selectedCategory !== "all" 
        ? { category: selectedCategory }
        : {};
      return base44.entities.Discussion.filter(filter, "-created_date", 50);
    },
  });

  const filteredDiscussions = discussions.filter(post => {
    if (!searchQuery) return true;
    return post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.content?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pinnedPosts = filteredDiscussions.filter(p => p.is_pinned);
  const regularPosts = filteredDiscussions.filter(p => !p.is_pinned);

  const createPostMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Discussion.create({
        ...newPost,
        author_id: user.id,
        author_name: user.full_name,
        likes: 0,
        comments_count: 0,
        is_pinned: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      setCreateDialog(false);
      setNewPost({ title: "", content: "", category: "general" });
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      return base44.entities.Discussion.update(post.id, {
        likes: (post.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    }
  });

  const categories = [
    { value: "general", label: "General", icon: MessageCircle, color: "bg-slate-100 text-slate-700" },
    { value: "routes", label: "Routes", icon: Route, color: "bg-emerald-100 text-emerald-700" },
    { value: "safety", label: "Safety", icon: Shield, color: "bg-red-100 text-red-700" },
    { value: "tips", label: "Tips", icon: Lightbulb, color: "bg-amber-100 text-amber-700" },
    { value: "events", label: "Events", icon: Calendar, color: "bg-violet-100 text-violet-700" },
  ];

  const getCategoryInfo = (value) => categories.find(c => c.value === value) || categories[0];

  const DiscussionCard = ({ post, isPinned }) => {
    const category = getCategoryInfo(post.category);
    
    return (
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all ${isPinned ? 'ring-2 ring-emerald-200' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                {post.author_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isPinned && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    <Badge className={category.color}>
                      <category.icon className="w-3 h-3 mr-1" />
                      {category.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mt-2">{post.title}</h3>
                </div>
              </div>
              
              <p className="text-slate-600 text-sm line-clamp-3 mb-4">{post.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{post.author_name}</span>
                  <span>•</span>
                  <span>{format(new Date(post.created_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user) {
                        likePostMutation.mutate(post);
                      }
                    }}
                    className="text-slate-500 hover:text-emerald-600"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {post.likes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments_count || 0}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Community</h1>
          <p className="text-slate-500">Share tips, ask questions, and connect with fellow riders</p>
        </div>
        <Button 
          onClick={() => {
            if (!user) {
              base44.auth.redirectToLogin();
            } else {
              setCreateDialog(true);
            }
          }}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className={selectedCategory === "all" ? "bg-emerald-500" : ""}
          >
            All Topics
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={selectedCategory === cat.value ? "bg-emerald-500" : ""}
            >
              <cat.icon className="w-4 h-4 mr-1" />
              {cat.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{discussions.length}</div>
            <div className="text-sm text-slate-500">Discussions</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {discussions.reduce((sum, p) => sum + (p.likes || 0), 0)}
            </div>
            <div className="text-sm text-slate-500">Total Likes</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-violet-600">
              {new Set(discussions.map(p => p.author_id)).size}
            </div>
            <div className="text-sm text-slate-500">Contributors</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Discussions */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDiscussions.length > 0 ? (
        <div className="space-y-4">
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <AnimatePresence>
              {pinnedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <DiscussionCard post={post} isPinned={true} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Regular Posts */}
          <AnimatePresence>
            {regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DiscussionCard post={post} isPinned={false} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Discussions Yet</h3>
            <p className="text-slate-500 mb-6">
              Be the first to start a conversation!
            </p>
            <Button onClick={() => setCreateDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
              Start Discussion
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Post Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <Select
                value={newPost.category}
                onValueChange={(v) => setNewPost({ ...newPost, category: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                placeholder="What's on your mind?"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Share your thoughts, tips, or questions..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="mt-2"
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createPostMutation.mutate()}
              disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}