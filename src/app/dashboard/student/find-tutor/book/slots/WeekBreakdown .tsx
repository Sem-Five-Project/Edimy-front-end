import { Calendar } from "lucide-react"

type SimpleSchedule = { id: string; date: string; time: string; duration: string };

export const WeekBreakdown = ({ schedules, hourlyRate = 1000 }: { schedules: SimpleSchedule[], hourlyRate?: number }) => {
  const calculateWeeklySchedule = () => {
    const weeks = [
      { week: 1, label: "1st Week", period: "Sep 1-7" },
      { week: 2, label: "2nd Week", period: "Sep 8-14" },
      { week: 3, label: "3rd Week", period: "Sep 15-21" },
      { week: 4, label: "4th Week", period: "Sep 22-28" },
      { week: 5, label: "5th Week", period: "Sep 29-30" }
    ]

    return weeks.map(({ week, label, period }) => {
      const weekSchedules = schedules.map((schedule, index) => {
        // Simulate some booking conflicts for demonstration
        const isConflict = week === 3 && index === 1
        const duration = parseInt(schedule.duration.split(' ')[0])
        
        return {
          ...schedule,
          isConflict,
          hours: duration,
          cost: isConflict ? 0 : duration * hourlyRate
        }
      })

      const totalHours = weekSchedules.reduce((sum, s) => sum + (s.isConflict ? 0 : s.hours), 0)
      const totalCost = weekSchedules.reduce((sum, s) => sum + s.cost, 0)
      const hasConflict = weekSchedules.some(s => s.isConflict)

      return {
        week,
        label,
        period,
        schedules: weekSchedules,
        totalHours,
        totalCost,
        hasConflict
      }
    })
  }

  const weeklyBreakdown = calculateWeeklySchedule()
  const totalPayment = weeklyBreakdown.reduce((sum, week) => sum + week.totalCost, 0)
  const totalHours = weeklyBreakdown.reduce((sum, week) => sum + week.totalHours, 0)
  const availableWeeks = weeklyBreakdown.filter(w => w.totalCost > 0).length

  if (schedules.length === 0) return null

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Monthly Schedule Overview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Weekly breakdown with availability and pricing
          </p>
        </div>
      </div>
      
      {/* Weekly Cards Grid - Compact Design */}
      <div className="space-y-3">
        {weeklyBreakdown.map(({ week, label, period, schedules: weekSchedules, totalHours, totalCost, hasConflict }) => (
          <div key={week} className={`rounded-xl border transition-all duration-200 ${
            hasConflict 
              ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200/60 dark:border-red-800/20' 
              : totalCost > 0
              ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200/60 dark:border-green-800/20'
              : 'bg-gray-50/50 dark:bg-gray-900/10 border-gray-200/60 dark:border-gray-700/20'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    hasConflict 
                      ? 'bg-red-500' 
                      : totalCost > 0
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}>
                    <span className="text-white text-xs font-bold">{week}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {label} • {period}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rs.{totalCost.toLocaleString()} • {totalHours}h
                  </span>
                </div>
              </div>
              
              {/* Compact schedule items */}
              <div className="flex flex-wrap gap-2">
                {weekSchedules.map((schedule, idx) => (
                  <div key={idx} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                    schedule.isConflict 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      schedule.isConflict ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="font-medium">
                      {schedule.date} {schedule.time}
                    </span>
                    {schedule.isConflict && (
                      <span className="text-red-600 dark:text-red-400 text-xs">• Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}
