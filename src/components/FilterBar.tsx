// Form GET thuần — không cần JavaScript, submit sẽ đổi query string và trang
// server-render lại với bộ lọc mới. Vẫn hoạt động đúng yêu cầu "kết hợp nhiều
// bộ lọc, cập nhật kết quả thực tế".
export default function FilterBar({
  basePath,
  authors,
  currentQuery,
  defaults,
}: {
  basePath: string;
  authors: string[];
  currentQuery?: string;
  defaults: { sort?: string; author?: string; from?: string; to?: string };
}) {
  return (
    <form method="get" action={basePath} className="mb-6 flex flex-wrap items-end gap-3 rounded-sm border border-line bg-mist/60 p-3">
      {currentQuery !== undefined && (
        <input type="hidden" name="q" value={currentQuery} />
      )}
      <div>
        <label className="block text-[11px] font-semibold text-ink/50">Sắp xếp</label>
        <select
          name="sort"
          defaultValue={defaults.sort || "newest"}
          className="mt-1 rounded border border-line bg-white px-2 py-1.5 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-ink/50">Tác giả</label>
        <select
          name="author"
          defaultValue={defaults.author || ""}
          className="mt-1 rounded border border-line bg-white px-2 py-1.5 text-sm"
        >
          <option value="">Tất cả</option>
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-ink/50">Từ ngày</label>
        <input
          type="date"
          name="from"
          defaultValue={defaults.from || ""}
          className="mt-1 rounded border border-line bg-white px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-ink/50">Đến ngày</label>
        <input
          type="date"
          name="to"
          defaultValue={defaults.to || ""}
          className="mt-1 rounded border border-line bg-white px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-navy px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-light"
      >
        Lọc
      </button>
    </form>
  );
}
