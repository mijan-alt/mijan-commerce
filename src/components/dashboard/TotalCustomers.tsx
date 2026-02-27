import type { WidgetServerProps } from 'payload'
import './style.scss'

export default async function TotalCustomers({ req }: WidgetServerProps) {
  const { payload } = req

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Get ALL TIME customers count
  const allTimeCustomers = await payload.count({
    collection: 'users',
  })

  // Get TODAY's new customers
  const todayCustomers = await payload.count({
    collection: 'users',
    where: {
      createdAt: {
        greater_than_equal: today.toISOString(),
      },
    },
  })

  // Get YESTERDAY's new customers for comparison
  const yesterdayCustomers = await payload.count({
    collection: 'users',
    where: {
      and: [
        {
          createdAt: {
            greater_than_equal: yesterday.toISOString(),
          },
        },
        {
          createdAt: {
            less_than: today.toISOString(),
          },
        },
      ],
    },
  })

  // Calculate percentage change (today vs yesterday)
  const percentageChange =
    yesterdayCustomers.totalDocs > 0
      ? ((todayCustomers.totalDocs - yesterdayCustomers.totalDocs) / yesterdayCustomers.totalDocs) *
        100
      : 0

  const isPositive = percentageChange >= 0

  return (
    <div className="dashboard-card dashboard-card--customers">
      <div className="dashboard-card__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>

      <div className="dashboard-card__content">
        <span className="dashboard-card__label">Total Customers</span>
        <div className="dashboard-card__value">{allTimeCustomers.totalDocs.toLocaleString()}</div>

        <div className="dashboard-card__footer">
          <div className={`dashboard-card__badge ${todayCustomers.totalDocs > 0 ? 'dashboard-card__badge--active' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>
              {todayCustomers.totalDocs > 0
                ? `+${todayCustomers.totalDocs} today`
                : 'No new today'}
            </span>
          </div>

          {yesterdayCustomers.totalDocs > 0 && percentageChange !== 0 && (
            <span className={`dashboard-card__trend dashboard-card__trend--${isPositive ? 'up' : 'down'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {isPositive ? (
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                ) : (
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                )}
              </svg>
              {Math.abs(percentageChange).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}