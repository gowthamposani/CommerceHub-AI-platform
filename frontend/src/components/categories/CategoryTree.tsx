import { ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { CategoryTreeNode } from "@/types/category";

function TreeNode({ node, depth = 0 }: { node: CategoryTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={!hasChildren}
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? "Collapse category" : "Expand category"}
        >
          {hasChildren ? expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}
        </Button>
        <FolderTree className={depth > 0 ? "h-4 w-4 text-brand-blue" : "h-4 w-4 text-gray-500"} />
        <Link to={`/categories/${node.id}`} className="text-sm font-bold text-gray-950 hover:text-brand-blue">
          {node.category_name}
        </Link>
        <span className="text-xs text-gray-500">{node.category_slug}</span>
        <Badge tone={node.status === "active" ? "success" : "warning"}>{node.status}</Badge>
      </div>
      {hasChildren && expanded ? (
        <ul className="space-y-1 border-l border-gray-100">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CategoryTree({ categories }: { categories: CategoryTreeNode[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Category Hierarchy</h2>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <EmptyState title="No Categories Found" message="Create parent and child categories to view hierarchy." />
        ) : (
          <ul className="space-y-1">
            {categories.map((category) => (
              <TreeNode key={category.id} node={category} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
