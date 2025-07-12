"use client"

function BadgeItem({ badge, earnedDate, isEarned }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div
      className={`rounded-lg p-4 border-2 transition-all ${
        isEarned
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      {/* Badge Icon and Title */}
      <div className="text-center mb-3">
        <div className={`text-4xl mb-2 ${isEarned ? "" : "grayscale"}`}>{badge.icon}</div>
        <h3 className={`font-semibold ${isEarned ? "text-gray-800" : "text-gray-500"}`}>{badge.name}</h3>
      </div>

      {/* Badge Description */}
      <p className={`text-sm text-center mb-3 ${isEarned ? "text-gray-600" : "text-gray-400"}`}>{badge.description}</p>

      {/* Badge Status */}
      <div className="text-center">
        {isEarned ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-green-600">✅ EARNED</div>
            {earnedDate && <div className="text-xs text-gray-500">on {formatDate(earnedDate)}</div>}
          </div>
        ) : (
          <div className="text-xs font-medium text-gray-400">🔒 LOCKED</div>
        )}
      </div>

      {/* Badge Rarity Indicator */}
      <div className="mt-3 text-center">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            badge.rarity === "common"
              ? "bg-gray-100 text-gray-600"
              : badge.rarity === "rare"
                ? "bg-blue-100 text-blue-600"
                : badge.rarity === "epic"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {badge.rarity.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export default BadgeItem
