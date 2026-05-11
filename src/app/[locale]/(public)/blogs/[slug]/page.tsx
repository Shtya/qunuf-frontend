import PageHeroSection from "@/components/atoms/PageHeroSection";
import { getLocale, getTranslations } from "next-intl/server";
import api from "@/libs/axios";
import { Blog } from "@/types/dashboard/blog";
import { notFound } from "next/navigation";
import RecentBlogs from "@/components/pages/blogs/RecentBlogs";

interface BlogsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata dynamically from blog
export async function generateMetadata({ params }: BlogsPageProps) {
  const t = await getTranslations("blogs.hero");
  const locale = await getLocale();

  const { slug } = await params;

  let title = t("title");
  let description = t("description");

  try {
    const res = await api.get(`/blogs/${slug}`);
    const blog: Blog = res.data;

    title = locale === "ar" ? blog.title_ar : blog.title_en || title;
    description =
      locale === "ar" ? blog.description_ar : blog.description_en || description;
  } catch (err) {
    console.error("Error fetching blog for metadata:", err);
  }

  return {
    title,
    description,
  };
}

export default async function BlogsPage({ params }: BlogsPageProps) {
  const t = await getTranslations("blogs.hero");
  const locale = await getLocale();
  const { slug } = await params;

  let blog: Blog | null = null;

  try {
    const res = await api.get(`/blogs/${slug}`);
    blog = res.data;
  } catch (err) {
    console.error("Error fetching blog:", err);
  }

  if (!blog) return notFound();

  return (
    <section id="blogs" className="relative overflow-hidden">
      <PageHeroSection
        title={locale === "ar" ? blog.title_ar : blog.title_en || t("title")}
        buttonText={t("seeMore")}
      />
      <RecentBlogs slug={slug} />
    </section>
  );
}