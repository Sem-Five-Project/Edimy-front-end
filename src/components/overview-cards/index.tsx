import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "@/lib/fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { views, profit, products, users } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Total Sessions"
        data={{
          value: compactFormat(views.value),
          growthRate: views.growthRate,
        }}
        Icon={icons.Sessions}
      />

      <OverviewCard
        label="Total Profit"
        data={{
          value: compactFormat(profit.value) + " LKR",
          growthRate: profit.growthRate,
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Subjects"
        data={{
          value: compactFormat(products.value),
          growthRate: products.growthRate,
        }}
        Icon={icons.Subjects}
      />

      <OverviewCard
        label="Total Users"
        data={{
          value: compactFormat(users.value),
          growthRate: users.growthRate,
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
