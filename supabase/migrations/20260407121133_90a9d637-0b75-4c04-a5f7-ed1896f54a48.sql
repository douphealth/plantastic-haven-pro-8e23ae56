
-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'masterclass', 'expert');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  care_streak INTEGER NOT NULL DEFAULT 0,
  total_plants_saved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create master plants table
CREATE TABLE public.plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  scientific_name TEXT,
  common_names TEXT[] DEFAULT '{}',
  care_difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (care_difficulty IN ('easy', 'moderate', 'hard', 'expert')),
  light_needs TEXT NOT NULL DEFAULT 'bright indirect',
  water_frequency_days INTEGER NOT NULL DEFAULT 7,
  humidity TEXT DEFAULT 'moderate',
  temp_min INTEGER DEFAULT 15,
  temp_max INTEGER DEFAULT 30,
  toxicity_pets BOOLEAN DEFAULT false,
  toxicity_children BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'houseplant',
  propagation_methods TEXT[] DEFAULT '{}',
  common_problems TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plants are viewable by everyone" ON public.plants FOR SELECT USING (true);

-- Create user_plants table
CREATE TABLE public.user_plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  location TEXT DEFAULT 'Indoor',
  room TEXT,
  photo_url TEXT,
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  last_watered TIMESTAMP WITH TIME ZONE,
  next_water_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plants" ON public.user_plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own plants" ON public.user_plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plants" ON public.user_plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plants" ON public.user_plants FOR DELETE USING (auth.uid() = user_id);

-- Create plant journal entries
CREATE TABLE public.plant_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  note TEXT,
  milestone_type TEXT CHECK (milestone_type IN ('growth', 'bloom', 'repot', 'propagation', 'issue', 'general')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plant_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries" ON public.plant_journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries" ON public.plant_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.plant_journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.plant_journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Create community posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'question', 'tip', 'showcase', 'swap')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_plants_updated_at BEFORE UPDATE ON public.user_plants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for plant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-photos', 'plant-photos', true);

CREATE POLICY "Anyone can view plant photos" ON storage.objects FOR SELECT USING (bucket_id = 'plant-photos');
CREATE POLICY "Authenticated users can upload plant photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'plant-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own photos" ON storage.objects FOR UPDATE USING (bucket_id = 'plant-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own photos" ON storage.objects FOR DELETE USING (bucket_id = 'plant-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
