import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogPage() {
    const allPostsData = getSortedPostsData();

    return (
        <main className="max-w-2xl mx-auto pt-20 px-4">
            <h1 className="text-3xl font-bold mb-8">Blog</h1>
            <ul className="space-y-6">
                {allPostsData.map(({ id, title, date }) => (
                    <li key={id}>
                        <Link
                            href={`/blog/${id}`}
                            className="text-xl font-semibold text-primary hover:underline"
                        >
                            {title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                            {new Date(date).toLocaleDateString()}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
