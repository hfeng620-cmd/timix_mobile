import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "福利 Drop — Timix观察站",
  description:
    "AI 中转站社区专属福利发放，完成赞助商注册并提交反馈即可领取限量兑换码。",
  openGraph: {
    title: "福利 Drop — Timix观察站",
    description:
      "AI 中转站社区专属福利发放，完成赞助商注册并提交反馈即可领取限量兑换码。",
  },
};

export default function DropsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
