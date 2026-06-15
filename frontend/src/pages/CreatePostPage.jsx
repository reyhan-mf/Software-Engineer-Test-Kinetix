import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";
import { ArrowLeft } from "../components/icons";

const CreatePostPage = () => (
  <div className="min-h-dvh bg-[#FBF3D5]">
    <Navbar />
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to posts
      </Link>

      <div className="mb-6">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Create a new post
        </h1>
        <p className="mt-1.5 text-stone-600">
          Share your story with the community.
        </p>
      </div>

      <PostForm mode="create" />
    </main>
  </div>
);

export default CreatePostPage;
