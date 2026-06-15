<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 🧩 Agent Skills
- Frontend Design: Sempre que houver solicitações de modificação de layout, UI ou UX, utilize obrigatoriamente a skill frontend-design (em: .agents/skills/frontend-design/SKILL.md) para garantir a qualidade estética.
- Supabase & Prisma: Sempre que houver solicitações relacionadas a banco de dados, utilize obrigatoriamente a skill supabase-postgress-best-practices (em: .agents/skills/supabase-postgress-best-practices/SKILL.md) para garantir a qualidade do código.
- Next.js 16: Sempre que houver solicitações relacionadas a Next.js 16, utilize obrigatoriamente a skill nextjs-best-practices (em: .agents/skills/nextjs-best-practices/SKILL.md) para garantir a qualidade do código.
- Caveman: Utilize obrigatoriamente a skill caveman (em: .agents/skills/caveman/SKILL.md) para otimização nos tokens e performance nas solicitações para os modelos. Seja conciso e objetivo nas suas respostas.
