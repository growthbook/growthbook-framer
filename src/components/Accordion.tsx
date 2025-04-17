import { useState } from "react";
import { CaretDown, CaretRight } from "./Icons";
import { SectionHeader } from "./SectionHeader";

export function Accordion({
  items,
  defaultOpenId,
}: {
  items: {
    id: string;
    title: string;
    content: React.ReactNode;
    icon: React.ReactNode;
    isOpen?: boolean;
  }[];
  defaultOpenId?: string;
}) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultOpenId ? new Set([defaultOpenId]) : new Set()
  );

  const handleToggle = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="accordion">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          onToggle={() => handleToggle(item.id)}
          isOpen={openItems.has(item.id)}
        />
      ))}
    </div>
  );
}

export function AccordionItem({
  item,
  onToggle,
  isOpen,
}: {
  item: {
    id: string;
    title: string;
    content: React.ReactNode;
    icon: React.ReactNode;
  };
  onToggle: () => void;
  isOpen: boolean;
}) {
  const { id, title, content } = item;

  return (
    <div className="accordion-item">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        id={`${id}-button`}
        className="accordion-button"
      >
        <SectionHeader title={title} icon={item.icon} />
        {isOpen ? <CaretDown /> : <CaretRight />}
      </button>

      <div
        id={`${id}-content`}
        className="accordion-content"
        hidden={!isOpen}
        aria-labelledby={`${id}-button`}
        role="region"
      >
        {isOpen && <div className="accordion-content">{content}</div>}
      </div>
    </div>
  );
}
