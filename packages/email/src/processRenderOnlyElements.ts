import serialize from 'dom-serializer';
import { type AnyNode, Document, isTag } from 'domhandler';
import { filter, removeElement } from 'domutils';
import { parseDocument as parse } from 'htmlparser2';

type RenderType = 'text' | 'html';

export { serialize, parse };

export function process(dom: Document, keep: 'text' | 'html') {
  const remove = keep === 'text' ? 'html' : 'text';

  filter(isRenderType(remove), dom, true).forEach(removeElement);
  filter(isRenderType(keep), dom, true).forEach(inlineElement);

  return dom;
}

const isRenderType = (type: RenderType) => (node: AnyNode) =>
  isTag(node) && node.attribs['data-render-only'] === type;

const inlineElement = (el: AnyNode) => {
  if (!isTag(el)) return;
  const parent = el.parent;
  if (!parent) return;

  if (!el.attribs['data-render-inline']) {
    delete el.attribs['data-render-only'];
    return;
  }

  // Remove the wrapper element and insert all children
  const index = parent.children.indexOf(el);
  parent.children.splice(index, 1, ...el.children);
  // Update parent references for all children
  for (const child of el.children) {
    child.parent = el.parent;
  }
};
