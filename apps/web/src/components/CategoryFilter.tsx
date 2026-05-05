interface Category {
  label: string;
  value: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isActive
                ? 'text-white border-transparent shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-500'
            }`}
            style={isActive ? { backgroundColor: '#ff4747', borderColor: '#ff4747' } : {}}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
