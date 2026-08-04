import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const searchJobFeeds = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        roles: z.array(z.string()).default([]),
        locations: z.array(z.string()).default([]),
        excluded: z.array(z.string()).default([]),
        perQuery: z.number().min(5).max(50).default(25),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { searchFeeds } = await import("./jobsearch.server");
    return searchFeeds(data);
  });
