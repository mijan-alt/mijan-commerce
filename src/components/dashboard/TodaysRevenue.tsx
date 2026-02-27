import type { WidgetServerProps } from 'payload'
import './style.scss'

export default async function TodaysRevenue({ req }: WidgetServerProps) {
  const { payload } = req

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Get TODAY's revenue
  const todayOrders = await payload.find({
    collection: 'orders',
    where: {
      and: [
        {
          createdAt: {
            greater_than_equal: today.toISOString(),
          },
        },
        {
          status: {
            equals: 'completed',
          },
        },
      ],
    },
    limit: 1000,
  })

  const todayRevenue = todayOrders.docs.reduce((sum, order: any) => sum + (order.amount || 0), 0)

  // Get YESTERDAY's revenue
  const yesterdayOrders = await payload.find({
    collection: 'orders',
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
        {
          status: {
            equals: 'completed',
          },
        },
      ],
    },
    limit: 1000,
  })

  const yesterdayRevenue = yesterdayOrders.docs.reduce((sum, order: any) => sum + (order.amount || 0), 0)

  // Calculate percentage change
  const percentageChange =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0

  const isPositive = percentageChange >= 0

  return (
    <div className="dashboard-card dashboard-card--revenue">
      <div className="dashboard-card__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>

      <div className="dashboard-card__content">
        <span className="dashboard-card__label">Today&apos;s Revenue</span>
        <div className="dashboard-card__value">₦{todayRevenue.toLocaleString()}</div>

        <div className="dashboard-card__footer">
          <div className={`dashboard-card__badge ${todayOrders.totalDocs > 0 ? 'dashboard-card__badge--active' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>
              {todayOrders.totalDocs > 0
                ? `${todayOrders.totalDocs} order${todayOrders.totalDocs !== 1 ? 's' : ''}`
                : 'No orders'}
            </span>
          </div>

          {yesterdayRevenue > 0 && percentageChange !== 0 && (
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