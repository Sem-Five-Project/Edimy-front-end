import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getPaymentsOverviewData } from "@/services/charts.services";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function PaymentsOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = await getPaymentsOverviewData(timeFrame);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Payments Overview
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="payments_overview" />
      </div>

      <PaymentsOverviewChart data={data} />

      <dl className="grid text-center [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div>
          <dt className="text-xl font-bold text-dark dark:text-white">
            {standardFormat(
              data.received.reduce(
                (acc: number, { y }: { y: number }) => acc + y,
                0,
              ) * 1000, // Multiply back by 1000 since we divided in the service
            )}{" "}
            LKR
          </dt>
          <dd className="font-medium dark:text-dark-6">Total Payments {timeFrame === "yearly" ? "(in K)" : ""}</dd>
        </div>
      </dl>
    </div>
  );
}
