interface TabPlaceholderProps {
  title: string;
}

export function TabPlaceholder({ title }: TabPlaceholderProps) {
  return (
    <section>
      <h2 className="mb-4 border-b-2 border-gray-100 pb-2 text-sm font-black uppercase tracking-[0.18em] text-gray-500">
        {title}
      </h2>
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-black uppercase tracking-[0.15em] text-gray-300">
        Em construção
      </div>
    </section>
  );
}
