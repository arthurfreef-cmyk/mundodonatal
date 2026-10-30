import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Retorna a descrição (HTML da própria loja) de um produto, sem pesar no carregamento do site. */
export const getDescription = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ handle: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data }) => {
    const all = (await import("@/data/descriptions.json")).default as Record<string, string>;
    return { html: all[data.handle] ?? "" };
  });
