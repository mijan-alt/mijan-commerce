import type { WidgetServerProps } from 'payload'
import './style.scss'

export default async function TotalProducts({ req }: WidgetServerProps) {
  const { payload } = req

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Get ALL TIME products count (published)
  const allTimeProducts = await payload.count({
    collection: 'products',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  // Get TODAY's new products
  const todayProducts = await payload.count({
    collection: 'products',
    where: {
      and: [
        {
          createdAt: {
            greater_than_equal: today.toISOString(),
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  // Get YESTERDAY's new products for comparison
  const yesterdayProducts = await payload.count({
    collection: 'products',
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
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  // Calculate percentage change (today vs yesterday)
  const percentageChange =
    yesterdayProducts.totalDocs > 0
      ? ((todayProducts.totalDocs - yesterdayProducts.totalDocs) / yesterdayProducts.totalDocs) *
        100
      : 0

  const isPositive = percentageChange >= 0

  return (
    <div className="dashboard-card dashboard-card--products">
      <div className="dashboard-card__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>

      <div className="dashboard-card__content">
        <span className="dashboard-card__label">Total Products</span>
        <div className="dashboard-card__value">{allTimeProducts.totalDocs.toLocaleString()}</div>

        <div className="dashboard-card__footer">
          <div className={`dashboard-card__badge ${todayProducts.totalDocs > 0 ? 'dashboard-card__badge--active' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>
              {todayProducts.totalDocs > 0
                ? `+${todayProducts.totalDocs} today`
                : 'No new today'}
            </span>
          </div>

          {yesterdayProducts.totalDocs > 0 && percentageChange !== 0 && (
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