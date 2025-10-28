import { container } from "../../../_lib/container.ts";

export const createRequestScopedContainer = () => {
  const scopedContainer = container.createScope();

  return scopedContainer.cradle;
};
