import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/best-teacher-ever")({
  component: BestTeacherEverPage,
  head: () => ({
    meta: [{ title: "Best Teacher Ever" }],
  }),
});

function BestTeacherEverPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/" });
    }, 15000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <h1
        className="px-6 text-center font-serif font-bold uppercase tracking-tight text-foreground"
        style={{ fontSize: "clamp(3rem, 12vw, 10rem)", lineHeight: 1 }}
      >
        BEST TEACHER EVER
      </h1>
    </div>
  );
}
