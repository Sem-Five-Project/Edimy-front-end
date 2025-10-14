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
          growthRate: 0, // Remove the 0.43% indicator
        }}
        Icon={icons.Sessions}
      />

      <OverviewCard
        label="Total Profit"
        data={{
          value: compactFormat(profit.value) + " LKR",
          growthRate: 0, // Remove the 4.35% indicator
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Subjects"
        data={{
          value: compactFormat(products.value),
          growthRate: 0, // Remove the 2.59% indicator
        }}
        Icon={icons.Subjects}
      />

      <OverviewCard
        label="Total Users"
        data={{
          value: compactFormat(users.value),
          growthRate: 0, // Remove the -0.95% gain symbol
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
