// Design-lab mode. On only where .env.local sets NEXT_PUBLIC_LAB=1 (the lab
// worktree); that file is git-ignored, so the main app and Vercel never see it.
// In the lab, forms skip validation and the lab toolbar is shown.
export const LAB = process.env.NEXT_PUBLIC_LAB === "1"
