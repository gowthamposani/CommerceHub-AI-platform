import type { Category, CategoryTreeNode } from "@/types/category";

export function flattenCategoryTree(nodes: CategoryTreeNode[], depth = 0): Array<Category & { depth: number }> {
  return nodes.flatMap((node) => [{ ...node, depth }, ...flattenCategoryTree(node.children, depth + 1)]);
}

export function collectDescendantIds(nodes: CategoryTreeNode[], categoryId: string): Set<string> {
  const descendants = new Set<string>();

  function visit(node: CategoryTreeNode): boolean {
    if (node.id === categoryId) {
      node.children.forEach(addChildren);
      return true;
    }
    return node.children.some(visit);
  }

  function addChildren(node: CategoryTreeNode): void {
    descendants.add(node.id);
    node.children.forEach(addChildren);
  }

  nodes.some(visit);
  return descendants;
}
