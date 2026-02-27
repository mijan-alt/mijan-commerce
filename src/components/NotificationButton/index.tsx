'use client'

import { useEffect, useRef, useState } from 'react'
import './style.scss'

type Notification = {
  id: string
  type: 'low-stock' | 'out-of-stock' | 'new-order' | 'order-update'
  title: string
  message: string
  timestamp: Date
  read: boolean
  productId?: string
  orderId?: string
}

type NotificationStats = {
  lowStockCount: number
  outOfStockCount: number
  recentOrdersCount: number
  notifications: Notification[]
}

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('readNotifications')
    if (stored) {
      try {
        setReadNotifications(new Set(JSON.parse(stored)))
      } catch (error) {
        console.error('Failed to parse read notifications:', error)
      }
    }
  }, [])

  // Fetch notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // const markAsRead = async (notificationId: string) => {
  //   try {
  //     await fetch(`/api/notifications/${notificationId}/read`, {
  //       method: 'POST',
  //     })
  //     if (stats) {
  //       setStats({
  //         ...stats,
  //         notifications: stats.notifications.map((n) =>
  //           n.id === notificationId ? { ...n, read: true } : n,
  //         ),
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Failed to mark notification as read:', error)
  //   }
  // }

  const markAsRead = (notificationId: string) => {
    // Update state
    setReadNotifications((prev) => {
      const updated = new Set(prev)
      updated.add(notificationId)

      // Persist to localStorage (NO API CALL)
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(updated)))

      return updated
    })
  }

  const notificationsWithReadStatus =
    stats?.notifications.map((n) => ({
      ...n,
      read: n.read || readNotifications.has(n.id),
    })) || []

  const unreadCount = notificationsWithReadStatus.filter((n) => !n.read).length

  return (
    <>
      <button
        ref={buttonRef}
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg
          className="notification-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && <div className="notification-backdrop" onClick={() => setIsOpen(false)} />}

      <div
        className={`notification-sidebar ${isOpen ? 'notification-sidebar--open' : ''}`}
        ref={dropdownRef}
      >
        {/* Header */}
        <div className="notification-header">
          <div>
            <h2 className="notification-title">Notifications</h2>
            <p className="notification-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <button className="notification-close" onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="notification-stats">
            <div className="stat-card stat-card--warning">
              <div className="stat-header">
                <svg
                  className="stat-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="stat-label">Low Stock</span>
              </div>
              <p className="stat-value">{stats.lowStockCount}</p>
            </div>

            <div className="stat-card stat-card--danger">
              <div className="stat-header">
                <svg
                  className="stat-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="stat-label">Out of Stock</span>
              </div>
              <p className="stat-value">{stats.outOfStockCount}</p>
            </div>

            <div className="stat-card stat-card--info">
              <div className="stat-header">
                <svg
                  className="stat-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="stat-label">Recent Orders (24h)</span>
              </div>
              <p className="stat-value">{stats.recentOrdersCount}</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">
              <div className="spinner" />
            </div>
          ) : stats && stats.notifications.length > 0 ? (
            stats.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClose={() => setIsOpen(false)}
              />
            ))
          ) : (
            <div className="notification-empty">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                opacity="0.3"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>No notifications</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onClose: () => void
}) {
  const getIcon = () => {
    const iconProps = {
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
    }

    switch (notification.type) {
      case 'low-stock':
        return (
          <svg {...iconProps} className="notification-item-icon notification-item-icon--warning">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
          </svg>
        )
      case 'out-of-stock':
        return (
          <svg {...iconProps} className="notification-item-icon notification-item-icon--danger">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        )
      case 'new-order':
        return (
          <svg {...iconProps} className="notification-item-icon notification-item-icon--info">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        )
      default:
        return (
          <svg {...iconProps} className="notification-item-icon">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
        )
    }
  }

  const getLink = () => {
    if (notification.productId) {
      return `/admin/collections/products/${notification.productId}`
    }
    if (notification.orderId) {
      return `/admin/collections/orders/${notification.orderId}`
    }
    return null
  }

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    const link = getLink()
    if (link) {
      window.location.href = link
      onClose()
    }
  }

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    const intervals: Record<string, number> = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    }

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value)
      if (interval >= 1) {
        return `${interval} ${key}${interval !== 1 ? 's' : ''} ago`
      }
    }
    return 'Just now'
  }

  return (
    <button
      onClick={handleClick}
      className={`notification-item ${!notification.read ? 'notification-item--unread' : ''}`}
    >
      <div className="notification-item-icon-wrapper">{getIcon()}</div>
      <div className="notification-item-content">
        <div className="notification-item-header">
          <p className="notification-item-title">{notification.title}</p>
          {!notification.read && <span className="notification-item-dot" />}
        </div>
        <p className="notification-item-message">{notification.message}</p>
        <p className="notification-item-time">{timeAgo(notification.timestamp)}</p>
      </div>
    </button>
  )
}
