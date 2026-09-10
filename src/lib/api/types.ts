export type Author = { displayName: string; number: number } | null;

export type MediaType = "image" | "video" | "document";

export type Media = {
  url: string;
  key: string;
  type: MediaType;
  size?: number;
};

export type PersonSnapshot = {
  name: string;
  designation?: string;
  organization?: string;
  state: string;
  city?: string;
};

export type PostStatus = "active" | "removed" | "under_review";

export type Post = {
  _id: string;
  slug?: string;
  author: Author;
  person: string;
  personSnapshot: PersonSnapshot;
  description: string;
  media: Media[];
  upvoteCount: number;
  voteScore: number;
  commentCount: number;
  saveCount: number;
  reportCount: number;
  trendingScore: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  myVote?: 0 | 1;
  isSavedByMe?: boolean;
};

export type Person = {
  _id: string;
  slug?: string;
  name: string;
  designation?: string;
  organization?: string;
  location: { state: string; city?: string };
  slugKey: string;
  stats: { postsCount: number; totalVotes: number; totalComments: number };
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  _id: string;
  post: string;
  author: Author;
  parentComment: string | null;
  content: string;
  upvoteCount: number;
  replyCount: number;
  status: "active" | "deleted";
  createdAt: string;
  updatedAt: string;
  myVote?: 0 | 1;
};

export type Paginated<T> = { items: T[]; nextCursor: string | null };

export type StateAgg = {
  state: string;
  postCount: number;
  /** Same value as voteCount (there's no downvote) — kept for API compatibility. */
  voteScore: number;
  voteCount: number;
  commentCount: number;
};

export type CityAgg = {
  city: string;
  postCount: number;
  /** Same value as voteCount (there's no downvote) — kept for API compatibility. */
  voteScore: number;
  voteCount: number;
  commentCount: number;
};

export type AuthUser = {
  id: string;
  email: string;
  anonymousIdentity: { label: string; number: number; displayName: string };
  role: "user" | "admin";
  status: "active" | "suspended";
  postsCount: number;
  commentsCount: number;
  savedPostsCount: number;
  createdAt: string;
};

export type ProfileComment = Omit<Comment, "author" | "post"> & {
  post: Pick<Post, "_id" | "slug" | "personSnapshot" | "status">;
};

export type ProfileActivity = {
  type: "post" | "comment" | "saved" | "vote";
  createdAt: string;
  post: Post | Pick<Post, "_id" | "slug" | "personSnapshot" | "status">;
  content?: string;
};

export type SearchResult = {
  posts: Post[];
  people: (Person & { score?: number })[];
  organizations: string[];
  locations: string[];
};

export type FeedSort = "latest" | "trending" | "popular" | "discussed";
