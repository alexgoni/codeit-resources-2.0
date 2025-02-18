import { z } from "zod";

const ALLOWED_DOMAINS = [
  "codeit.kr",
  "dev.resource.codeit.kr",
  "codeit.com",
] as const;

const emailSchema = z
  .string()
  .min(1, "이메일은 필수 입력입니다.")
  .email("이메일 형식으로 작성해 주세요.")
  .refine(
    (email) => ALLOWED_DOMAINS.some((domain) => email.endsWith(`@${domain}`)),
    {
      message: "이메일 도메인은 @codeit.com 이어야 합니다.",
    },
  );

const memberSchema = z.object({
  role: z.enum(["MEMBER", "ADMIN"]),
  username: z
    .string()
    .min(1, "멤버 이름은 필수 입력입니다.")
    .max(10, "멤버 이름은 최대 10자 이하입니다."),
  email: emailSchema,
});

export type TeamInput = {
  username: string;
  email: string;
  teams: string[];
  role: "MEMBER" | "ADMIN";
  image?: string | null;
};

export { emailSchema, memberSchema };
