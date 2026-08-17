export function QuestionCard({ text, codeSnippet }: { text: string; codeSnippet: string | null }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold italic text-champagne sm:text-3xl">
        {text}
      </p>
      {codeSnippet ? (
        <pre className="stage-panel mt-4 overflow-x-auto rounded-sm p-5 font-[family-name:var(--font-code)] text-sm leading-relaxed text-champagne">
          {codeSnippet}
        </pre>
      ) : null}
    </div>
  );
}
