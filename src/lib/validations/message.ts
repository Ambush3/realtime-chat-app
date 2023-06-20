// validator that parse messages
import { z } from "zod";

export const messageValidator = z.object({
    id: z.string(),
    senderId: z.string(),
    // in future if wanting to set max message length you can set z.string().max(1000) or whatever
    text: z.string(),
    timestamp: z.number(),
})

export const messageArrayValidator = z.array(messageValidator);

// infer type of message
export type Message = z.infer<typeof messageValidator>;
