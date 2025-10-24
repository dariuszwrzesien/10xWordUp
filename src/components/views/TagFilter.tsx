import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TagDTO } from "@/types/dto.types";

interface TagFilterProps {
  tags: TagDTO[];
  selectedTagId: string | null;
  onTagChange: (tagId: string | null) => void;
}

export default function TagFilter({ tags, selectedTagId, onTagChange }: TagFilterProps) {
  return (
    <Select value={selectedTagId || "all"} onValueChange={(value) => onTagChange(value === "all" ? null : value)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtruj po tagu" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Wszystkie słówka</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
